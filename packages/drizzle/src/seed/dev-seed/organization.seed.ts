import { faker } from "@faker-js/faker";

import {
  InsertOrganization,
  OrganizationDataModel,
  OrganizationTable,
} from "../../schemas";
import { db } from "../seed-db-client";
import { seedConfigs } from "../seed.config";

export async function seedOrganization(): Promise<
  Array<OrganizationDataModel>
> {
  console.log("🌱 Seeding organization...");

  const orgsData: Array<InsertOrganization> = Array.from({
    length: seedConfigs.targets.organizations,
  }).map(
    () =>
      ({
        name: faker.company.name(),
        slug: faker.company.name().toLowerCase().replace(/\s/g, "-"),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      }) satisfies InsertOrganization
  );

  const orgs = await db.insert(OrganizationTable).values(orgsData).returning();

  console.log(`✅ ${orgs.length} Organizations seeded`);
  return orgs;
}
