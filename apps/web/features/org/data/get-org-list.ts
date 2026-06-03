import "server-only";

import { cache } from "react";

import { eq } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  type OrganizationDataModel,
  OrganizationMemberTable,
  OrganizationTable,
} from "@workspace/drizzle/schemas";

import { db } from "@/lib/db";

export async function getOrgList(
  userId: string,
  database: DatabaseType
): Promise<
  Array<OrganizationDataModel & { memberRole: string; joinedAt: Date }>
> {
  const results = await database
    .select({
      organization: OrganizationTable,
      memberRole: OrganizationMemberTable.role,
      joinedAt: OrganizationMemberTable.createdAt,
    })
    .from(OrganizationMemberTable)
    .innerJoin(
      OrganizationTable,
      eq(OrganizationTable.id, OrganizationMemberTable.organizationId)
    )
    .where(eq(OrganizationMemberTable.userId, userId));

  return results.map((r) => ({
    ...r.organization,
    memberRole: r.memberRole,
    joinedAt: r.joinedAt,
  }));
}

export const getOrgListCache = cache(async (userId: string) =>
  getOrgList(userId, db)
);
