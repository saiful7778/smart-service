import { ORPCInstrumentation } from "@orpc/otel";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,
  environment: process.env.NODE_ENV,
  openTelemetryInstrumentations: [new ORPCInstrumentation()],
  spotlight: process.env.NODE_ENV === "development",
});
