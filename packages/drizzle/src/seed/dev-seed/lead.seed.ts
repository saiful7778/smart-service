import { faker } from "@faker-js/faker";

import {
  CustomerDataModel,
  InsertLead,
  InsertLeadCategoryJoin,
  LeadCategoryDataModel,
  LeadCategoryJoinTable,
  LeadDataModel,
  LeadTable,
} from "../../schemas";
import { LEAD_SOURCE, LEAD_STATUS } from "../../schemas/enums/enum-values";
import { db } from "../seed-db-client";
import { seedConfigs } from "../seed.config";

export async function seedLead(
  customers: Array<CustomerDataModel>,
  leadCategories: Array<LeadCategoryDataModel>
): Promise<Array<LeadDataModel>> {
  console.log("🌱 Seeding lead...");

  const leadsData: Array<InsertLead> = Array.from({
    length: seedConfigs.targets.leads,
  }).map(() => {
    const customer = faker.helpers.arrayElement(customers);
    const leadCategory = faker.helpers.arrayElement(leadCategories);

    return {
      orgId: customer.orgId,
      status: faker.helpers.arrayElement(LEAD_STATUS),
      source: faker.helpers.arrayElement(LEAD_SOURCE),
      createdBy: customer.createdBy,
      serviceType: leadCategory.name,
      description: faker.helpers.maybe(() => faker.lorem.paragraph(), {
        probability: 0.5,
      }),
    } satisfies InsertLead;
  });

  const leads = await db.insert(LeadTable).values(leadsData).returning();

  const leadCategoryJoinsData: Array<InsertLeadCategoryJoin> = leads.map(
    (lead) =>
      ({
        leadId: lead.id,
        leadCategoryId: faker.helpers.arrayElement(leadCategories).id,
      }) satisfies InsertLeadCategoryJoin
  );

  await db
    .insert(LeadCategoryJoinTable)
    .values(leadCategoryJoinsData)
    .returning();

  console.log(`✅ ${leads.length} Leads seeded`);
  return leads;
}
