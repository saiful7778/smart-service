import "server-only";

import { cache } from "react";

import { and, eq, inArray } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  OrganizationMemberTable,
  OrganizationTable,
  OrgMemberRoleTable,
  PermissionDataModel,
  PermissionTable,
  RoleDataModel,
  RolePermissionTable,
  RoleTable,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";

import { db } from "@/lib/db";

import { PermissionWithContext, RoleWithContext } from "@/types";

export async function getUserRolesAndPermission(
  userId: string,
  database: DatabaseType = db
): Promise<{
  roles: Array<
    Pick<RoleDataModel, "id" | "type" | "roleName" | "customRoleName">
  >;
  permissions: Array<
    Pick<PermissionDataModel, "id" | "name" | "level" | "resource" | "action">
  >;
}> {
  const rolesData = await database
    .select({
      id: RoleTable.id,
      type: RoleTable.type,
      roleName: RoleTable.roleName,
      customRoleName: RoleTable.customRoleName,
    })
    .from(UserTable)
    .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
    .innerJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
    .where(eq(UserTable.id, userId));

  if (rolesData.length === 0) {
    throw new Error("User has no role");
  }

  const permissions = await database
    .select({
      id: PermissionTable.id,
      name: PermissionTable.name,
      level: PermissionTable.level,
      resource: PermissionTable.resource,
      action: PermissionTable.action,
    })
    .from(PermissionTable)
    .innerJoin(
      RolePermissionTable,
      eq(PermissionTable.id, RolePermissionTable.permissionId)
    )
    .where(
      inArray(
        RolePermissionTable.roleId,
        rolesData.map((r) => r.id)
      )
    );

  return {
    roles: rolesData,
    permissions,
  };
}

export const getUserRolesAndPermissionCache = cache(
  async (userId: string): ReturnType<typeof getUserRolesAndPermission> =>
    await getUserRolesAndPermission(userId)
);

export async function getUserRolesAndPermissionWithContext(
  userId: string,
  database: DatabaseType = db
): Promise<{
  roles: Array<RoleWithContext>;
  permissions: Array<PermissionWithContext>;
} | null> {
  // Execute both queries in parallel
  const [systemRoles, orgRoles] = await Promise.all([
    database
      .select({
        role: {
          roleName: RoleTable.roleName,
          type: RoleTable.type,
          customRoleName: RoleTable.customRoleName,
        },
        permission: {
          name: PermissionTable.name,
          level: PermissionTable.level,
          resource: PermissionTable.resource,
          action: PermissionTable.action,
        },
      })
      .from(UserRoleTable)
      .innerJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .innerJoin(
        RolePermissionTable,
        eq(RolePermissionTable.roleId, UserRoleTable.roleId)
      )
      .innerJoin(
        PermissionTable,
        eq(PermissionTable.id, RolePermissionTable.permissionId)
      )
      .where(
        and(eq(UserRoleTable.userId, userId), eq(RoleTable.type, "SYSTEM"))
      ),

    database
      .select({
        role: {
          roleName: RoleTable.roleName,
          type: RoleTable.type,
          customRoleName: RoleTable.customRoleName,
        },
        permission: {
          name: PermissionTable.name,
          level: PermissionTable.level,
          resource: PermissionTable.resource,
          action: PermissionTable.action,
        },
        orgId: OrganizationTable.id,
        orgSlug: OrganizationTable.slug,
      })
      .from(OrganizationMemberTable)
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.orgMemberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .innerJoin(
        OrganizationTable,
        eq(OrganizationTable.id, OrganizationMemberTable.organizationId)
      )
      .innerJoin(
        RolePermissionTable,
        eq(RolePermissionTable.roleId, RoleTable.id)
      )
      .innerJoin(
        PermissionTable,
        eq(PermissionTable.id, RolePermissionTable.permissionId)
      )
      .where(
        and(
          eq(OrganizationMemberTable.userId, userId),
          eq(RoleTable.type, "ORG")
        )
      ),
  ]);

  if (systemRoles.length === 0) {
    throw new Error("User has no system role");
  }

  const permissionMap = new Map<string, PermissionWithContext>();
  const roleMap = new Map<string, RoleWithContext>();

  for (let i = 0; i < systemRoles.length; i++) {
    const row = systemRoles[i]!;
    const permission = row.permission;
    const role = row.role;

    permissionMap.set(permission.name, {
      name: permission.name,
      level: permission.level,
      resource: permission.resource,
      action: permission.action,
      source: "SYSTEM",
      orgId: undefined,
      orgSlug: undefined,
    });

    roleMap.set(role.roleName, {
      roleName: role.roleName,
      type: role.type,
      customRoleName: role.customRoleName,
      source: "SYSTEM",
      orgId: undefined,
      orgSlug: undefined,
    });
  }

  // Process org roles - batch the set operations
  for (let i = 0; i < orgRoles.length; i++) {
    const row = orgRoles[i]!;
    const permission = row.permission;
    const role = row.role;
    const orgId = row.orgId;
    const orgSlug = row.orgSlug;

    permissionMap.set(permission.name + orgId, {
      name: permission.name,
      level: permission.level,
      resource: permission.resource,
      action: permission.action,
      source: "ORG",
      orgId,
      orgSlug,
    });

    roleMap.set(role.roleName + orgId, {
      roleName: role.roleName,
      type: role.type,
      customRoleName: role.customRoleName,
      source: "ORG",
      orgId,
      orgSlug,
    });
  }

  return {
    roles: [...roleMap.values()],
    permissions: [...permissionMap.values()],
  };
}

export const getUserRolesAndPermissionWithContextCache = cache(
  async (
    userId: string
  ): ReturnType<typeof getUserRolesAndPermissionWithContext> =>
    await getUserRolesAndPermissionWithContext(userId)
);
