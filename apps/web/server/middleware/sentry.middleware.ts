import * as Sentry from "@sentry/nextjs";

import { getIp } from "@/utils/getIp";

import { baseOs } from "../orpc.base";

export const sentryMiddleware = baseOs.middleware(async ({ next, context }) => {
  return Sentry.withIsolationScope(async (scope) => {
    try {
      if (context.user) {
        scope.setUser({
          id: context.user.id,
          email: context.user.email ?? undefined,
          username: context.user.name ?? undefined,
          ip_address: getIp(context.reqHeaders),
          segment:
            context.roles?.map((r) => r.roleName).join(",") ?? "anonymous",
        });
      } else {
        scope.setUser(null);
      }

      scope.setTags({
        "auth.status": context.user ? "authenticated" : "anonymous",
      });

      return await next();
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  });
});
