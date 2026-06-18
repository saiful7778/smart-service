import { implement, ORPCError } from "@orpc/server";
import {
  and,
  countDistinct,
  eq,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";

import {
  OrgMemberRoleTable,
  PermissionTable,
  RolePermissionTable,
  RoleTable,
  UserRoleTable,
} from "@workspace/drizzle/schemas";
import { jsonbAgg } from "@workspace/drizzle/sql-helpers";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { loggerMiddleware } from "@/server/middleware/logger.middleware";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { roleContract } from "./role.contract";

export const roleImpl = implement(roleContract)
  .$context<ORPCContext>()
  .use(loggerMiddleware)
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const listRoleProcedure = roleImpl.listRole
  .use(userPermissionMiddleware(["system.role.list", "org.role.list"]))
  .handler(async ({ context }) => {
    const result = await context.db
      .select({
        id: RoleTable.id,
        roleName: RoleTable.roleName,
        type: RoleTable.type,
        customRoleName: RoleTable.customRoleName,
        description: RoleTable.description,
        metadata: RoleTable.metadata,
        createdAt: RoleTable.createdAt,
        totalUsers: sql<number>`COALESCE(${countDistinct(UserRoleTable.userId)}, 0)::integer`,
        permissions: jsonbAgg(
          {
            id: PermissionTable.id,
            level: PermissionTable.level,
            action: PermissionTable.action,
            resource: PermissionTable.resource,
            description: PermissionTable.description,
            name: PermissionTable.name,
            metadata: PermissionTable.metadata,
          },
          PermissionTable.id
        ),
      })
      .from(RoleTable)
      .leftJoin(UserRoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .leftJoin(
        RolePermissionTable,
        eq(RoleTable.id, RolePermissionTable.roleId)
      )
      .leftJoin(
        PermissionTable,
        eq(RolePermissionTable.permissionId, PermissionTable.id)
      )
      .groupBy(RoleTable.id);

    return apiResponse(API_MESSAGES.ROLE.GET_ALL, result);
  });

export const listOrgPermissionProcedure = roleImpl.listOrgPermission
  .use(userPermissionMiddleware(["org.permission.list"]))
  .handler(async ({ context }) => {
    const results = await context.db
      .select({
        id: PermissionTable.id,
        level: PermissionTable.level,
        action: PermissionTable.action,
        resource: PermissionTable.resource,
        description: PermissionTable.description,
        name: PermissionTable.name,
        metadata: PermissionTable.metadata,
      })
      .from(PermissionTable)
      .where(eq(PermissionTable.level, "org"));

    return apiResponse(API_MESSAGES.PERMISSION.GET_ALL, results);
  });

export const listOrgRoleProcedure = roleImpl.listOrgRole
  .use(orgMemberPermissionsMiddleware(["org.role.list"]))
  .handler(async ({ context }) => {
    const orgId = context.session.activeOrganizationId!;

    const result = await context.db
      .select({
        id: RoleTable.id,
        roleName: RoleTable.roleName,
        type: RoleTable.type,
        customRoleName: RoleTable.customRoleName,
        description: RoleTable.description,
        metadata: RoleTable.metadata,
        createdAt: RoleTable.createdAt,
        permissions: jsonbAgg(
          {
            id: PermissionTable.id,
            level: PermissionTable.level,
            action: PermissionTable.action,
            resource: PermissionTable.resource,
            description: PermissionTable.description,
            name: PermissionTable.name,
            metadata: PermissionTable.metadata,
          },
          PermissionTable.id
        ),
      })
      .from(RoleTable)
      .leftJoin(OrgMemberRoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .leftJoin(
        RolePermissionTable,
        eq(RoleTable.id, RolePermissionTable.roleId)
      )
      .leftJoin(
        PermissionTable,
        eq(RolePermissionTable.permissionId, PermissionTable.id)
      )
      .where(
        and(
          eq(RoleTable.type, "ORG"),
          or(eq(RoleTable.orgId, orgId), isNull(RoleTable.orgId))
        )
      )
      .groupBy(RoleTable.id);

    return apiResponse(API_MESSAGES.ROLE.GET_ALL, result);
  });

export const createOrgRoleProcudure = roleImpl.createOrgRole
  .use(orgMemberPermissionsMiddleware(["org.role.create"]))
  .handler(async ({ input, context }) => {
    const orgId = context.session.activeOrganizationId!;

    const [roleExist] = await context.db
      .select({ id: RoleTable.id })
      .from(RoleTable)
      .where(
        and(
          eq(RoleTable.orgId, orgId),
          eq(RoleTable.roleName, input.roleName),
          eq(RoleTable.customRoleName, input.customRoleName)
        )
      )
      .limit(1);

    if (roleExist) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.ROLE.EXIST,
      });
    }

    const [role] = await context.db
      .insert(RoleTable)
      .values({
        roleName: input.roleName,
        customRoleName: input.customRoleName,
        description: input.description,
        type: "ORG",
        orgId,
      })
      .returning();

    if (!role) {
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }

    await context.db.insert(RolePermissionTable).values(
      input.permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission,
      }))
    );

    return apiResponse(API_MESSAGES.ROLE.CREATE, role);
  });

export const updateOrgRoleProcedure = roleImpl.updateOrgRole
  .use(orgMemberPermissionsMiddleware(["org.role.update"]))
  .handler(async ({ context, input }) => {
    const orgId = context.session.activeOrganizationId!;

    const [roleExist] = await context.db
      .select({ id: RoleTable.id })
      .from(RoleTable)
      .where(
        and(
          eq(RoleTable.id, input.roleId),
          eq(RoleTable.orgId, orgId),
          isNotNull(RoleTable.customRoleName)
        )
      )
      .limit(1);

    if (!roleExist) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.ROLE.NOT_FOUND,
      });
    }

    const [updatedRole] = await context.db
      .update(RoleTable)
      .set({
        customRoleName: input.customRoleName,
        roleName: input.roleName,
        description: input.description,
      })
      .where(eq(RoleTable.id, roleExist.id))
      .returning();

    if (!updatedRole) {
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }

    await context.db
      .delete(RolePermissionTable)
      .where(eq(RolePermissionTable.roleId, updatedRole.id));

    await context.db.insert(RolePermissionTable).values(
      input.permissions.map((permission) => ({
        roleId: updatedRole.id,
        permissionId: permission,
      }))
    );

    return apiResponse(API_MESSAGES.ROLE.UPDATE, updatedRole);
  });

export const deleteOrgRoleProcedure = roleImpl.deleteOrgRole
  .use(orgMemberPermissionsMiddleware(["org.role.delete"]))
  .handler(async ({ context, input }) => {
    const orgId = context.session.activeOrganizationId!;

    const [roleExist] = await context.db
      .select({ id: RoleTable.id })
      .from(RoleTable)
      .where(
        and(
          eq(RoleTable.id, input.roleId),
          eq(RoleTable.orgId, orgId),
          isNotNull(RoleTable.customRoleName)
        )
      )
      .limit(1);

    if (!roleExist) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.ROLE.NOT_FOUND,
      });
    }

    await context.db
      .delete(RolePermissionTable)
      .where(eq(RolePermissionTable.roleId, roleExist.id));

    await context.db.delete(RoleTable).where(eq(RoleTable.id, roleExist.id));

    return apiResponse(API_MESSAGES.ROLE.DELETE, null);
  });
