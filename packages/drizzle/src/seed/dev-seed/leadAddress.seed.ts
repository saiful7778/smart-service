import { faker } from "@faker-js/faker";

import {
  AddressDataModel,
  InsertLeadAddress,
  LeadAddressDataModel,
  LeadAddressTable,
  LeadDataModel,
} from "../../schemas";
import { db } from "../seed-db-client";

export async function seedLeadAddress(
  leads: Array<LeadDataModel>,
  addresses: Array<AddressDataModel>
): Promise<Array<LeadAddressDataModel>> {
  console.log("🌱 Seeding lead address...");

  const leadAddressesData: Array<InsertLeadAddress> = leads.map(
    (lead) =>
      ({
        leadId: lead.id,
        addressId: faker.helpers.arrayElement(addresses).id,
        isPrimary: faker.datatype.boolean({ probability: 0.8 }),
      }) satisfies InsertLeadAddress
  );

  const leadAddresses = await db
    .insert(LeadAddressTable)
    .values(leadAddressesData)
    .returning();

  console.log(`✅ ${leadAddresses.length} Lead addresses seeded`);
  return leadAddresses;
}
