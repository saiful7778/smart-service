import "server-only";

import { cache } from "react";

import { eq } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  type OrganizationDataModel,
  OrganizationTable,
} from "@workspace/drizzle/schemas";

import { db } from "@/lib/db";

export async function getActiveOrg(
  orgId: string,
  database: DatabaseType
): Promise<OrganizationDataModel | undefined> {
  const [result] = await database
    .select()
    .from(OrganizationTable)
    .where(eq(OrganizationTable.id, orgId))
    .limit(1);

  return result;
}

export const getActiveOrgCache = cache(async (orgId: string) =>
  getActiveOrg(orgId, db)
);
