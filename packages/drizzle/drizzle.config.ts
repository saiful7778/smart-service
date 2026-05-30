import { join } from "node:path";

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const NODE_ENV = process.env.NODE_ENV || "development";

config({
  path: [
    join(process.cwd(), "../../.env"),
    join(process.cwd(), `../../.env.${NODE_ENV}.local`),
  ],
});

export default defineConfig({
  dialect: "postgresql",
  out: "../../supabase/migrations",
  schema: "./src/schemas/**",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  entities: {
    roles: {
      provider: "supabase",
    },
  },
  strict: true,
});
