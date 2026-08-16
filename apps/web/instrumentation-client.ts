import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: true,
    }),
  ],

  environment: process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NODE_ENV,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
