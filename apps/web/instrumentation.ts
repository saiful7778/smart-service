import * as Sentry from "@sentry/nextjs";

export async function register() {
  console.log("Initialized Smart Service app");

  if (process.env.NODE_ENV === "development") {
    (await import("@upstash/qstash")).startDevServer();
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./server/orpc.server-client");
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
export const onRequestError = Sentry.captureRequestError;
