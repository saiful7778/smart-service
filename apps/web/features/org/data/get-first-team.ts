import { asc, eq } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  type OrgTeamDataModel,
  OrgTeamMemberTable,
  OrgTeamTable,
} from "@workspace/drizzle/schemas";

export async function getFirstTeam(
  userId: string,
  database: DatabaseType
): Promise<OrgTeamDataModel | undefined> {
  const [result] = await database
    .select({
      team: OrgTeamTable,
    })
    .from(OrgTeamMemberTable)
    .innerJoin(OrgTeamTable, eq(OrgTeamMemberTable.teamId, OrgTeamTable.id))
    .where(eq(OrgTeamMemberTable.userId, userId))
    .orderBy(asc(OrgTeamMemberTable.createdAt))
    .limit(1);

  return result?.team;
}
