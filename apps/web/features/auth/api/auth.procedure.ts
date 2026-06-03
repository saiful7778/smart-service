import { implement } from "@orpc/server";

import { auth } from "@/lib/better-auth/auth";

import { RESET_PASSWORD_PATH } from "@/constants";
import { API_MESSAGES } from "@/constants/apiMessage";
import {
  authMiddleware,
  userRoleMiddleware,
} from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { loggerMiddleware } from "@/server/middleware/logger.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { authContract } from "./auth.contract";

export const authImpl = implement(authContract)
  .$context<ORPCContext>()
  .use(loggerMiddleware)
  .use(errorMiddleware);

export const requestResetPasswordProcedure = authImpl.requestResetPassword
  .use(privateRateLimitMiddleware)
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    await auth.api.requestPasswordReset({
      body: {
        email: input.email,
        redirectTo: RESET_PASSWORD_PATH,
      },
      headers: context.reqHeaders,
    });

    return {
      message: API_MESSAGES.AUTH.REQUEST_RESET_PASSWORD,
      success: true,
      data: null,
    };
  });

export const userBanProcedure = authImpl.ban
  .use(privateRateLimitMiddleware)
  .use(authMiddleware)
  .use(userRoleMiddleware(["SUPER_ADMIN"]))
  .handler(async ({ input, context }) => {
    if (input?.banned) {
      let banExpiresIn: number = 60 * 60 * 24 * 10;

      if (input.banExpires) {
        banExpiresIn = input.banExpires.getTime() - Date.now();
      }

      await auth.api.banUser({
        body: {
          userId: input.userId,
          banReason: input.banReason,
          banExpiresIn,
        },
        headers: context.reqHeaders,
      });

      return {
        message: API_MESSAGES.USER.BAN,
        success: true,
        data: null,
      };
    }

    await auth.api.unbanUser({
      body: {
        userId: input.userId,
      },
      headers: context.reqHeaders,
    });

    return {
      message: API_MESSAGES.USER.UNBAN,
      success: true,
      data: null,
    };
  });
