import { DatabaseType } from "@workspace/drizzle/client";
import {
  InsertLeadHistory,
  LeadHistoryTable,
} from "@workspace/drizzle/schemas";

export async function createLeadHistory(
  payload: InsertLeadHistory,
  tx: DatabaseType
) {
  const result = await tx.insert(LeadHistoryTable).values(payload);
  return result;
}
