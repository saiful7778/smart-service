import { join } from "node:path";

import { config } from "dotenv";

import { createDrizzleClient } from "../drizzle-client";

const NODE_ENV = process.env.NODE_ENV || "development";

config({
  path: [
    join(process.cwd(), "../../.env"),
    join(process.cwd(), `../../.env.${NODE_ENV}.local`),
  ],
});

export const db = createDrizzleClient({
  databaseUrl: process.env.DATABASE_URL!,
  isProd: false,
  operationMode: "seed",
});
