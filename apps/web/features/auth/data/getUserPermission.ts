import "server-only";

import { cache } from "react";

import { and, eq } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  OrganizationMemberTable,
  OrganizationTable,
  OrgMemberRoleTable,
  OrgRoleMemberTable,
  OrgRoleTable,
  PermissionTable,
  RolePermissionTable,
  RoleTable,
  UserRoleTable,
} from "@workspace/drizzle/schemas";

import { db } from "@/lib/db";

import { PermissionWithOrg, RoleWithOrg } from "@/types";

export async function getUserRolesAndPermissionWithOrg(
  userId: string,
  database: DatabaseType = db
): Promise<{
  roles: Array<RoleWithOrg>;
  permissions: Array<PermissionWithOrg>;
} | null> {
  const [systemRoles, systemOrgRoles, orgRoles] = await Promise.all([
    database
      .select({
        roleName: RoleTable.roleName,
        permissionName: PermissionTable.name,
        permissionLevel: PermissionTable.level,
        permissionResource: PermissionTable.resource,
        permissionAction: PermissionTable.action,
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
        roleName: RoleTable.roleName,
        permissionName: PermissionTable.name,
        permissionLevel: PermissionTable.level,
        permissionResource: PermissionTable.resource,
        permissionAction: PermissionTable.action,
        orgId: OrganizationTable.id,
        orgSlug: OrganizationTable.slug,
      })
      .from(OrganizationMemberTable)
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
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
      .where(eq(OrganizationMemberTable.userId, userId)),

    database
      .select({
        roleName: OrgRoleTable.role,
        permissionName: PermissionTable.name,
        permissionLevel: PermissionTable.level,
        permissionResource: PermissionTable.resource,
        permissionAction: PermissionTable.action,
        orgId: OrganizationTable.id,
        orgSlug: OrganizationTable.slug,
      })
      .from(OrganizationMemberTable)
      .innerJoin(
        OrgRoleMemberTable,
        eq(OrgRoleMemberTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(OrgRoleTable, eq(OrgRoleTable.id, OrgRoleMemberTable.roleId))
      .innerJoin(
        RolePermissionTable,
        eq(RolePermissionTable.roleId, OrgRoleTable.id)
      )
      .innerJoin(
        PermissionTable,
        eq(PermissionTable.id, RolePermissionTable.permissionId)
      )
      .innerJoin(
        OrganizationTable,
        eq(OrganizationTable.id, OrgRoleTable.organizationId)
      )
      .where(eq(OrganizationMemberTable.userId, userId)),
  ]);

  if (systemRoles.length === 0) {
    throw new Error("User has no system role");
  }

  const permissionMap = new Map<string, PermissionWithOrg>();
  const roleMap = new Map<string, RoleWithOrg>();

  for (let i = 0; i < systemRoles.length; i++) {
    const row = systemRoles[i]!;

    permissionMap.set(row.permissionName, {
      name: row.permissionName,
      level: row.permissionLevel,
      resource: row.permissionResource,
      action: row.permissionAction,
      source: "SYSTEM",
      orgId: undefined,
      orgSlug: undefined,
    });

    roleMap.set(row.roleName, {
      roleName: row.roleName,
      orgId: undefined,
      orgSlug: undefined,
    });
  }

  for (let i = 0; i < systemOrgRoles.length; i++) {
    const row = systemOrgRoles[i]!;

    permissionMap.set(row.permissionName + row.orgSlug, {
      name: row.permissionName,
      level: row.permissionLevel,
      resource: row.permissionResource,
      action: row.permissionAction,
      source: "ORG",
      orgId: row.orgId,
      orgSlug: row.orgSlug,
    });

    roleMap.set(row.roleName + row.orgSlug, {
      roleName: row.roleName,
      orgId: row.orgId,
      orgSlug: row.orgSlug,
    });
  }

  for (let i = 0; i < orgRoles.length; i++) {
    const row = orgRoles[i]!;

    permissionMap.set(row.permissionName + row.orgSlug, {
      name: row.permissionName,
      level: row.permissionLevel,
      resource: row.permissionResource,
      action: row.permissionAction,
      source: "ORG",
      orgId: row.orgId,
      orgSlug: row.orgSlug,
    });

    roleMap.set(row.roleName + row.orgSlug, {
      roleName: row.roleName,
      orgId: row.orgId,
      orgSlug: row.orgSlug,
    });
  }

  return {
    roles: Array.from(roleMap.values()),
    permissions: Array.from(permissionMap.values()),
  };
}

export const getUserRolesAndPermissionWithOrgCache = cache(
  async (userId: string): ReturnType<typeof getUserRolesAndPermissionWithOrg> =>
    await getUserRolesAndPermissionWithOrg(userId)
);
