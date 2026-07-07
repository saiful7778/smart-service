// @ts-check
/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = /** @type {ServiceWorkerGlobalScope & typeof globalThis} */ (
  globalThis
);

sw.addEventListener("install", () => {
  console.log("Service Worker installed");
  sw.skipWaiting();
});

sw.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener("push", (e) => {
  /** @type {{ id: string; data: unknown; createdAt: Date; updatedAt: Date; message: string; recipientId: string; actorId: string | null; orgId: string | null; category: "SYSTEM" | "ORG" | "LEAD" | "AUTH" | "BILLING" | "SUPPORT"; level: "INFO" | "SUCCESS" | "WARNING" | "ERROR"; title: string; isRead: boolean; readAt: Date | null; isArchived: boolean; } | null} */
  const payload = e.data?.json() ?? null;

  if (!payload) {
    console.log("No push data received");
    return;
  }

  async function handlePush() {
    if (!payload) {
      console.log("No push data received");
      return;
    }

    try {
      const windowClients = await sw.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const appInFocused = windowClients.some((client) => client.focused);

      if (appInFocused) {
        console.log("App is in focused");
        return;
      }

      await sw.registration.showNotification(payload.title, {
        body: payload.message,
      });
      console.log("Notification shown successfully");
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  }

  e.waitUntil(handlePush());
});

sw.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/dashboard";

  if (event.action === "dismiss") {
    console.log("User dismissed notification");
    return;
  }

  // Focus existing tab or open a new one
  async function handleClick() {
    const windowClients = await sw.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    for (const client of windowClients) {
      if (client.url === targetUrl && "focus" in client) {
        return client.focus();
      }
    }

    return sw.clients.openWindow(targetUrl);
  }

  event.waitUntil(handleClick());
});

sw.addEventListener("notificationclose", (event) => {
  console.log(
    "Notification closed without interaction",
    event.notification.title
  );
});
