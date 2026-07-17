import type { NextRequest } from "next/server";

import type {
  AnyContractRouter,
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";

import type { DatabaseType } from "@workspace/drizzle/client";
import type { PinoLoggerType } from "@workspace/lib/logger";
import { ExtendedRedis } from "@workspace/lib/redis";
import type { ServerSupabaseClient } from "@workspace/lib/supabase/server-client";

import type {
  AuthSession,
  AuthUser,
  PermissionWithOrg,
  RoleWithOrg,
} from "@/types";

export interface ORPCContext {
  reqHeaders: Readonly<NextRequest["headers"]>;
  db: Readonly<DatabaseType>;
  redisClient: ExtendedRedis;
  logger: PinoLoggerType;
  user: AuthUser | null;
  session: AuthSession | null;
  roles: Array<RoleWithOrg> | null;
  permissions: Array<PermissionWithOrg> | null;
  supabaseClient: ServerSupabaseClient;
}

export type InferContractRouterType<T extends AnyContractRouter> = {
  input: InferContractRouterInputs<T>;
  output: InferContractRouterOutputs<T>;
};
