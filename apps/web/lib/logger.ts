import { createPinoLogger,PinoLoggerType } from "@workspace/lib/logger";
import { env } from "./env";

const globalForLogger = globalThis as unknown as {
  logger?: PinoLoggerType;
};

export const logger: PinoLoggerType = 
  globalForLogger.logger ??
  createPinoLogger({
    isDev: env.NODE_ENV === "development",
    logLevel: env.API_LOG_LEVEL,
    serviceName: env.NEXT_PUBLIC_SITE_NAME,
  });

if (env.NODE_ENV !== "production") {
  globalForLogger.logger = logger;
}