import { faker } from "@faker-js/faker";

import {
  InsertOrgRole,
  OrganizationDataModel,
  OrgRoleDataModel,
  OrgRoleTable,
} from "../schemas";
import { db } from "./seed-db-client";

export async function seedOrgRoles(
  orgs: Array<OrganizationDataModel>
): Promise<Array<OrgRoleDataModel>> {
  console.log("🌱 Seeding organization roles...");

  const orgRoleData: Array<InsertOrgRole> = orgs.map((org) => {
    return {
      organizationId: org.id,
      role: faker.person.jobTitle(),
      permission: "",
    } satisfies InsertOrgRole;
  });

  const orgRoles = await db
    .insert(OrgRoleTable)
    .values(orgRoleData)
    .returning();

  console.log(`✅ ${orgRoles.length} Organization roles seeded`);
  return orgRoles;
}
