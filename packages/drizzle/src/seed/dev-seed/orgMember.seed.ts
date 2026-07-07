import { faker } from "@faker-js/faker";

import {
  InsertOrgMember,
  InsertOrgMemberRole,
  OrganizationDataModel,
  OrganizationMemberTable,
  OrgMemberDataModel,
  OrgMemberRoleTable,
  RoleDataModel,
  UserDataModel,
} from "../../schemas";
import { db } from "../seed-db-client";

export async function seedOrgMember(
  orgs: Array<OrganizationDataModel>,
  users: Array<UserDataModel>,
  orgSystemRoles: Array<RoleDataModel>
): Promise<Array<OrgMemberDataModel>> {
  console.log("🌱 Seeding organization members...");

  const allowdUsers = users.filter(({ role }) => role && role === "USER");

  const orgMembersData: Array<InsertOrgMember> = orgs.map((org) => {
    const user = faker.helpers.arrayElement(allowdUsers);
    const roleData = faker.helpers.arrayElement(orgSystemRoles);

    return {
      organizationId: org.id,
      userId: user.id,
      role: roleData.roleName,
    } satisfies InsertOrgMember;
  });

  const orgMembers = await db
    .insert(OrganizationMemberTable)
    .values(orgMembersData)
    .returning();

  const orgMemberRolesData: Array<InsertOrgMemberRole> = orgMembers.map(
    (orgMember) => {
      const roleData = orgSystemRoles.find(
        (role) => role.roleName === orgMember.role
      );
      return {
        memberId: orgMember.id,
        roleId: roleData!.id,
        orgId: orgMember.organizationId,
      } satisfies InsertOrgMemberRole;
    }
  );

  await db.insert(OrgMemberRoleTable).values(orgMemberRolesData);

  console.log(`✅ ${orgMembers.length} Organization members seeded`);
  return orgMembers;
}
