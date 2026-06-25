import { implement, ORPCError } from "@orpc/server";
import { and, countDistinct, eq, sql } from "drizzle-orm";

import {
  OrgRolePermissionTable,
  OrgRoleTable,
  PermissionDataModel,
  PermissionTable,
  RolePermissionTable,
  RoleTable,
  UserRoleTable,
} from "@workspace/drizzle/schemas";
import { jsonbAgg } from "@workspace/drizzle/sql-helpers";
import { apiResponse } from "@workspace/lib/utils";

import { auth } from "@/lib/better-auth/auth";

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
        description: RoleTable.description,
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
      })
      .from(PermissionTable)
      .where(eq(PermissionTable.level, "org"));

    return apiResponse(API_MESSAGES.PERMISSION.GET_ALL, results);
  });

export const listOrgRoleProcedure = roleImpl.listOrgRole
  .use(orgMemberPermissionsMiddleware(["org.role.list"]))
  .handler(async ({ context }) => {
    const [systemOrgRoles, orgRoles] = await Promise.all([
      context.db
        .select({
          id: RoleTable.id,
          roleName: RoleTable.roleName,
          description: RoleTable.description,
          createdAt: RoleTable.createdAt,
          permissions: jsonbAgg(
            {
              id: PermissionTable.id,
              level: PermissionTable.level,
              action: PermissionTable.action,
              resource: PermissionTable.resource,
              description: PermissionTable.description,
              name: PermissionTable.name,
            },
            PermissionTable.id
          ),
        })
        .from(RoleTable)
        .leftJoin(
          RolePermissionTable,
          eq(RoleTable.id, RolePermissionTable.roleId)
        )
        .leftJoin(
          PermissionTable,
          eq(RolePermissionTable.permissionId, PermissionTable.id)
        )
        .where(eq(RoleTable.type, "ORG"))
        .groupBy(RoleTable.id),
      context.db
        .select({
          id: OrgRoleTable.id,
          roleName: OrgRoleTable.role,
          createdAt: OrgRoleTable.createdAt,
          permissions: jsonbAgg(
            {
              id: PermissionTable.id,
              level: PermissionTable.level,
              action: PermissionTable.action,
              resource: PermissionTable.resource,
              description: PermissionTable.description,
              name: PermissionTable.name,
            },
            PermissionTable.id
          ),
        })
        .from(OrgRoleTable)
        .leftJoin(
          OrgRolePermissionTable,
          eq(OrgRoleTable.id, OrgRolePermissionTable.roleId)
        )
        .leftJoin(
          PermissionTable,
          eq(OrgRolePermissionTable.permissionId, PermissionTable.id)
        )
        .groupBy(OrgRoleTable.id),
    ]);

    const allRoles = new Map<
      string,
      {
        id: string;
        roleName: string;
        description: string | null;
        type: "system" | "dynamic";
        createdAt: Date;
        permissions: Array<
          Pick<
            PermissionDataModel,
            "id" | "level" | "action" | "resource" | "description" | "name"
          >
        >;
      }
    >();

    for (const role of systemOrgRoles) {
      allRoles.set(role.id, {
        id: role.id,
        roleName: role.roleName,
        description: role.description,
        type: "system",
        createdAt: role.createdAt,
        permissions: role.permissions,
      });
    }
    for (const role of orgRoles) {
      allRoles.set(role.id, {
        id: role.id,
        roleName: role.roleName,
        description: null,
        type: "dynamic",
        createdAt: role.createdAt,
        permissions: role.permissions,
      });
    }

    return apiResponse(
      API_MESSAGES.ROLE.GET_ALL,
      Array.from(allRoles.values())
    );
  });

export const createOrgRoleProcudure = roleImpl.createOrgRole
  .use(orgMemberPermissionsMiddleware(["org.role.create"]))
  .handler(async ({ input, context }) => {
    const orgId = context.session.activeOrganizationId!;

    const [roleExist] = await context.db
      .select({ id: OrgRoleTable.id })
      .from(OrgRoleTable)
      .where(
        and(
          eq(OrgRoleTable.organizationId, orgId),
          eq(OrgRoleTable.role, input.roleName)
        )
      )
      .limit(1);

    if (roleExist) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.ROLE.EXIST,
      });
    }

    const { roleData } = await auth.api.createOrgRole({
      body: {
        role: input.roleName,
        permission: {}, // TODO
        organizationId: orgId,
      },
      headers: context.reqHeaders,
    });

    await context.db.insert(OrgRolePermissionTable).values(
      input.permissions.map((permission) => ({
        roleId: roleData.id,
        permissionId: permission,
      }))
    );

    const [role] = await context.db
      .select()
      .from(OrgRoleTable)
      .where(eq(OrgRoleTable.id, roleData.id))
      .limit(1);

    return apiResponse(API_MESSAGES.ROLE.CREATE, role!);
  });

export const updateOrgRoleProcedure = roleImpl.updateOrgRole
  .use(orgMemberPermissionsMiddleware(["org.role.update"]))
  .handler(async ({ context, input }) => {
    const orgId = context.session.activeOrganizationId!;

    const [roleExist] = await context.db
      .select({ id: OrgRoleTable.id, roleName: OrgRoleTable.role })
      .from(OrgRoleTable)
      .where(
        and(
          eq(OrgRoleTable.id, input.roleId),
          eq(OrgRoleTable.organizationId, orgId)
        )
      )
      .limit(1);

    if (!roleExist) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.ROLE.NOT_FOUND,
      });
    }

    await context.db.transaction(async (tx) => {
      if (roleExist.roleName !== input.roleName) {
        await auth.api.updateOrgRole({
          body: {
            roleId: roleExist.id,
            organizationId: orgId,
            data: {
              roleName: input.roleName,
            },
          },
          headers: context.reqHeaders,
        });
      }
      if (input.permissions.length > 0) {
        await tx
          .delete(OrgRolePermissionTable)
          .where(eq(OrgRolePermissionTable.roleId, roleExist.id));

        await tx.insert(OrgRolePermissionTable).values(
          input.permissions.map((permission) => ({
            roleId: roleExist.id,
            permissionId: permission,
          }))
        );
      }
    });

    const [role] = await context.db
      .select()
      .from(OrgRoleTable)
      .where(eq(OrgRoleTable.id, input.roleId))
      .limit(1);

    return apiResponse(API_MESSAGES.ROLE.UPDATE, role!);
  });

export const deleteOrgRoleProcedure = roleImpl.deleteOrgRole
  .use(orgMemberPermissionsMiddleware(["org.role.delete"]))
  .handler(async ({ context, input }) => {
    const orgId = context.session.activeOrganizationId!;

    await context.db.transaction(async (tx) => {
      const [roleExist] = await tx
        .select({ id: OrgRoleTable.id, roleName: OrgRoleTable.role })
        .from(OrgRoleTable)
        .where(
          and(
            eq(OrgRoleTable.id, input.roleId),
            eq(OrgRoleTable.organizationId, orgId)
          )
        )
        .limit(1);

      if (!roleExist) {
        throw new ORPCError("BAD_REQUEST", {
          message: API_MESSAGES.ROLE.NOT_FOUND,
        });
      }

      await tx
        .delete(OrgRolePermissionTable)
        .where(eq(OrgRolePermissionTable.roleId, roleExist.id));

      await auth.api.deleteOrgRole({
        body: {
          roleId: roleExist.id,
          organizationId: orgId,
          roleName: roleExist.roleName,
        },
        headers: context.reqHeaders,
      });
    });

    return apiResponse(API_MESSAGES.ROLE.DELETE, null);
  });
