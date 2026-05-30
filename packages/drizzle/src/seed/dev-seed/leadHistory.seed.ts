import { faker } from "@faker-js/faker";

import {
  InsertLeadHistory,
  LeadDataModel,
  LeadHistoryDataModel,
  LeadHistoryTable,
} from "../../schemas";
import { HISTORY_EVENT_TYPE } from "../../schemas/enums/enum-values";
import { db } from "../seed-db-client";

export async function seedHistory(
  leads: Array<LeadDataModel>
): Promise<Array<LeadHistoryDataModel>> {
  console.log("🌱 Seeding lead histories...");

  const leadHistoriesData: Array<InsertLeadHistory & { createdAt: Date }> =
    leads
      .map((lead) =>
        HISTORY_EVENT_TYPE.map(
          (eventType) =>
            ({
              leadId: lead.id,
              eventType: eventType,
              title: `Lead ${eventType}`,
              description: `Lead ${eventType} automatically`,
              triggeredBy: lead.createdBy,
              triggeredByType: "user",
              createdAt: faker.date.past(),
            }) satisfies InsertLeadHistory & { createdAt: Date }
        )
      )
      .flat();

  const leadHistories = await db
    .insert(LeadHistoryTable)
    .values(leadHistoriesData)
    .returning();

  console.log(`✅ ${leadHistories.length} Lead histories seeded`);
  return leadHistories;
}
