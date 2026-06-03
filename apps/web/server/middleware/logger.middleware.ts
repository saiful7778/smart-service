import { baseOs } from "../orpc.base";

export const loggerMiddleware = baseOs.middleware(
  async ({ context, next, path }) => {
    const start = Date.now();

    const reqLogger = context.logger.child({
      path,
    });

    reqLogger.info("request");

    try {
      const result = await next();

      reqLogger.info({ durationMs: Date.now() - start }, "success");

      return result;
    } catch (err) {
      reqLogger.error({ durationMs: Date.now() - start, err }, "error");

      throw err;
    }
  }
);
