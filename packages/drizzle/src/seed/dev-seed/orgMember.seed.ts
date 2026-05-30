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
import { ORG_ROLES } from "../roles.seed";
import { db } from "../seed-db-client";

export async function seedOrgMember(
  orgs: Array<OrganizationDataModel>,
  users: Array<UserDataModel>,
  roles: Array<RoleDataModel>
): Promise<Array<OrgMemberDataModel>> {
  console.log("🌱 Seeding organization members...");

  const allowdRoles = roles.filter(({ roleName }) =>
    ORG_ROLES.includes(roleName)
  );

  const allowdUsers = users.filter(({ role }) => role && role === "USER");

  const orgMembersData: Array<InsertOrgMember> = [];

  for (const org of orgs) {
    for (const user of allowdUsers) {
      const roleData = faker.helpers.arrayElement(allowdRoles);

      orgMembersData.push({
        organizationId: org.id,
        userId: user.id,
        role: roleData.roleName,
      } satisfies InsertOrgMember);
    }
  }

  const orgMembers = await db
    .insert(OrganizationMemberTable)
    .values(orgMembersData)
    .returning();

  await db.insert(OrgMemberRoleTable).values(
    orgMembers.map(
      (orgMember) =>
        ({
          orgMemberId: orgMember.id,
          roleId: allowdRoles.find(
            ({ roleName }) => roleName === orgMember.role
          )!.id,
          orgId: orgMember.organizationId,
        }) satisfies InsertOrgMemberRole
    )
  );

  console.log(`✅ ${orgMembers.length} Organization members seeded`);
  return orgMembers;
}
