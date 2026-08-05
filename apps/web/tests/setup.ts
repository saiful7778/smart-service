import { afterAll, vi } from "vitest";

import { createMockDrizzleClient } from "@workspace/drizzle/client/mock";
import { createMockRedisClient } from "@workspace/lib/redis/mock";

vi.mock("@/lib/db", async () => {
  const db = await createMockDrizzleClient();
  return { db };
});

const redisClient = createMockRedisClient();

vi.mock("@/lib/redis-client", () => {
  return { redisClient: redisClient.Redis };
});

afterAll(() => {
  vi.clearAllMocks();
  redisClient.store.clear();
});
