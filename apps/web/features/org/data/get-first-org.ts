import "server-only";

import { and, asc, eq, ne } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  type OrganizationDataModel,
  OrganizationMemberTable,
  OrganizationTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";

export async function getFirstOrg(
  userId: string,
  database: DatabaseType
): Promise<OrganizationDataModel | undefined> {
  const [result] = await database
    .select({
      organization: OrganizationTable,
    })
    .from(OrganizationMemberTable)
    .innerJoin(
      OrganizationTable,
      eq(OrganizationMemberTable.organizationId, OrganizationTable.id)
    )
    .innerJoin(UserTable, eq(OrganizationMemberTable.userId, UserTable.id))
    .innerJoin(
      OrgMemberRoleTable,
      eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
    )
    .innerJoin(RoleTable, eq(OrgMemberRoleTable.roleId, RoleTable.id))
    .where(
      and(
        eq(UserTable.banned, false),
        eq(OrganizationMemberTable.userId, userId),
        ne(RoleTable.roleName, "SYSTEM_ADMIN"),
        ne(RoleTable.roleName, "SYSTEM_SUPPORT_AGENT"),
        ne(RoleTable.roleName, "SUPER_ADMIN")
      )
    )
    .orderBy(asc(OrganizationMemberTable.createdAt))
    .limit(1);

  return result?.organization;
}
