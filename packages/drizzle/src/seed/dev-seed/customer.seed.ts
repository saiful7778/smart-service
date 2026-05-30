import { faker } from "@faker-js/faker";

import {
  CustomerDataModel,
  CustomerTable,
  InsertCustomer,
  OrgMemberDataModel,
} from "../../schemas";
import { db } from "../seed-db-client";
import { seedConfigs } from "../seed.config";

export async function seedCustomer(
  orgMembers: Array<OrgMemberDataModel>
): Promise<Array<CustomerDataModel>> {
  console.log("🌱 Seeding customer...");

  const customerData: Array<InsertCustomer> = Array.from({
    length: seedConfigs.targets.customers,
  }).map(() => {
    const creator = faker.helpers.arrayElement(orgMembers);
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      orgId: creator.organizationId,
      createdBy: creator.id,
    } as InsertCustomer;
  });

  const customers = await db
    .insert(CustomerTable)
    .values(customerData)
    .returning();

  console.log(`✅ ${customers.length} Customers seeded`);
  return customers;
}
