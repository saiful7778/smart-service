import { SecondaryStorage } from "better-auth";

import { logger } from "../logger";
import { redisClient } from "../redis-client";

export const redisSecondaryStorage: SecondaryStorage = {
  async get(key: string) {
    try {
      const value = await redisClient.get(key);

      // Handle different return types from Redis
      if (value === null || value === undefined) {
        return null;
      }

      // If it's already a string, return it
      if (typeof value === "string") {
        return value;
      }

      // If it's an object, stringify it
      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      // Convert to string for any other type
      return String(value);
    } catch (err) {
      logger.error({ err });
      return null;
    }
  },

  async set(key: string, value: string, ttl?: number) {
    try {
      // Ensure value is a string
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      if (ttl) {
        // Set with TTL in seconds
        await redisClient.set(key, stringValue, { ex: ttl });
      } else {
        // Set without TTL
        await redisClient.set(key, stringValue);
      }
    } catch (err) {
      logger.error({ err });
      throw err;
    }
  },

  async delete(key: string) {
    try {
      await redisClient.del(key);
    } catch (err) {
      logger.error({ err });
      throw err;
    }
  },
};
