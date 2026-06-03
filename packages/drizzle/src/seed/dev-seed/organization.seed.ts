import { faker } from "@faker-js/faker";

import {
  AddressDataModel,
  InsertOrgAddress,
  InsertOrganization,
  OrgAddressTable,
  OrganizationDataModel,
  OrganizationTable,
} from "../../schemas";
import { db } from "../seed-db-client";
import { seedConfigs } from "../seed.config";

export async function seedOrganization(
  addresses: Array<AddressDataModel>
): Promise<Array<OrganizationDataModel>> {
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

  const orgAddressData: Array<InsertOrgAddress> = orgs.map((org) => {
    const address = faker.helpers.arrayElement(addresses);
    return {
      orgId: org.id,
      isPrimary: true,
      addressId: address.id,
    } satisfies InsertOrgAddress;
  });

  await db.insert(OrgAddressTable).values(orgAddressData);

  console.log(`✅ ${orgs.length} Organizations seeded`);
  return orgs;
}
