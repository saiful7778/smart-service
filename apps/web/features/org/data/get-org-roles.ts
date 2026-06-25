import { cache } from "react";

import { eq } from "drizzle-orm";

import { DatabaseType } from "@workspace/drizzle/client";
import { OrgRoleTable, RoleTable } from "@workspace/drizzle/schemas";

import { db } from "@/lib/db";

export async function getOrgRoles(
  orgId: string,
  database: DatabaseType
): Promise<Array<{ id: string; roleName: string }>> {
  const defaultRoles = await database
    .select({
      id: RoleTable.id,
      roleName: RoleTable.roleName,
    })
    .from(RoleTable)
    .where(eq(RoleTable.type, "ORG"));

  const orgRoles = await database
    .select({
      id: OrgRoleTable.id,
      roleName: OrgRoleTable.role,
    })
    .from(OrgRoleTable)
    .where(eq(OrgRoleTable.organizationId, orgId));

  return [...defaultRoles, ...orgRoles];
}

export const getOrgRolesCache = cache(
  async (orgId: string): ReturnType<typeof getOrgRoles> =>
    getOrgRoles(orgId, db)
);
