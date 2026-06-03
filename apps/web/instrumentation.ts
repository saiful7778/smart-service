export async function register() {
  console.log("Initialized Smart Service app");

  if (process.env.NODE_ENV === "development") {
    (await import("@upstash/qstash/nextjs")).registerQStashDev();
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./server/orpc.server-client");
  }
}
