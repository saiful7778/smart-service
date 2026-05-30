import { faker } from "@faker-js/faker";

import { AddressDataModel, AddressTable, InsertAddress } from "../../schemas";
import { db } from "../seed-db-client";

export async function seedAddress(): Promise<Array<AddressDataModel>> {
  console.log("🌱 Seeding address...");

  const addressesData: Array<InsertAddress> = Array.from({ length: 50 }).map(
    () =>
      ({
        line1: faker.location.streetAddress(),
        line2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      }) satisfies InsertAddress
  );

  const addresses = await db
    .insert(AddressTable)
    .values(addressesData)
    .returning();

  console.log(`✅ ${addresses.length} Addresses seeded`);
  return addresses;
}
