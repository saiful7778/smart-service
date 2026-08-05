import { eq, inArray } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  RoleTable,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { RoleEnumSchema, RoleEnumType } from "@workspace/drizzle/zod-db-enums";
import type { ServerSupabaseClient } from "@workspace/lib/supabase/server-client";

import { sendNotification } from "@/features/notification/data/sendNotification";

export const SUPPORT_AGENT_ROLES: Array<RoleEnumType> = [
  RoleEnumSchema.enum.SYSTEM_SUPPORT_AGENT,
  RoleEnumSchema.enum.SYSTEM_ADMIN,
  RoleEnumSchema.enum.SUPER_ADMIN,
];

interface NotifySupportAgentsProps {
  database: DatabaseType;
  supabaseClient: ServerSupabaseClient;
  actorId: string;
  payload: {
    category: "SUPPORT";
    level: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
    title: string;
    message: string;
    data?: Record<string, unknown>;
  };
}

export async function getSupportAgentIds(
  database: DatabaseType
): Promise<Array<string>> {
  const rows = await database
    .select({ id: UserTable.id })
    .from(UserRoleTable)
    .innerJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
    .innerJoin(UserTable, eq(UserTable.id, UserRoleTable.userId))
    .where(inArray(RoleTable.roleName, SUPPORT_AGENT_ROLES));

  return rows.map((row) => row.id);
}

export async function notifySupportAgents({
  database,
  supabaseClient,
  actorId,
  payload,
}: NotifySupportAgentsProps) {
  const agentIds = await getSupportAgentIds(database);

  await Promise.all(
    agentIds
      .filter((id) => id !== actorId)
      .map((recipientId) =>
        sendNotification({
          database,
          supabaseClient,
          payload: {
            recipientId,
            actorId,
            category: payload.category,
            level: payload.level,
            title: payload.title,
            message: payload.message,
            data: payload.data,
          },
        })
      )
  );
}
