import { faker } from "@faker-js/faker";

import {
  InsertLeadCategoryJoin,
  LeadCategoryDataModel,
  LeadCategoryJoinTable,
  LeadDataModel,
} from "../../schemas";
import { db } from "../seed-db-client";

export async function seedLeadCategoryJoin(
  leads: Array<LeadDataModel>,
  leadCategories: Array<LeadCategoryDataModel>
) {
  console.log("🌱 Seeding lead category join...");

  const leadCategoryJoinsData: Array<InsertLeadCategoryJoin> = leads.map(
    (lead) =>
      ({
        leadId: lead.id,
        leadCategoryId: faker.helpers.arrayElement(leadCategories).id,
      }) satisfies InsertLeadCategoryJoin
  );

  const leadCategoryJoins = await db
    .insert(LeadCategoryJoinTable)
    .values(leadCategoryJoinsData)
    .returning();

  console.log(`✅ ${leadCategoryJoins.length} Lead category joins seeded`);
  return leadCategoryJoins;
}
