import type { NextRequest } from "next/server";

import type { InferRouterOutputs } from "@orpc/server";
import type { AnyRouter } from "@orpc/server";

import type { DatabaseType } from "@workspace/drizzle/client";
import type { PinoLoggerType } from "@workspace/lib/logger";
import type { ServerSupabaseClient } from "@workspace/lib/supabase/server-client";

import type {
  AuthSession,
  AuthUser,
  PermissionWithContext,
  RoleWithContext,
} from "@/types";

export type InferProcedureOutput<T extends AnyRouter> =
  InferRouterOutputs<T>["data"];

export interface ORPCContext {
  reqHeaders: Readonly<NextRequest["headers"]>;
  db: Readonly<DatabaseType>;
  logger: PinoLoggerType;
  user: AuthUser | null;
  session: AuthSession | null;
  roles: Array<RoleWithContext> | null;
  permissions: Array<PermissionWithContext> | null;
  supabaseClient: ServerSupabaseClient;
}
