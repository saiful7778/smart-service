import { createStore } from "zustand";
import { combine, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { env } from "@/lib/env";

import { ListNotificationOutput } from "@/features/notification/api/notification.contract";

export interface NotificationStoreState {
  permission: NotificationPermission;
  notifications: ListNotificationOutput["data"];
}

export interface NotificationStoreAction {
  updatePermission: (permission: NotificationPermission) => void;
  addNotifications: (
    notification: ListNotificationOutput["data"][number]
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (ids: string[]) => void;
}

export function notificationStore(
  notifications: ListNotificationOutput["data"]
) {
  return createStore<NotificationStoreState & NotificationStoreAction>()(
    devtools(
      immer(
        combine<NotificationStoreState, NotificationStoreAction>(
          {
            permission: "default",
            notifications,
          },
          (set) => ({
            updatePermission: (permission) => {
              set((state) => {
                state.permission = permission;
                return state;
              });
            },
            addNotifications: (notification) => {
              set((state) => {
                const lastNotification = state.notifications[0];
                if (lastNotification?.id === notification.id) {
                  return state;
                }
                state.notifications.unshift(notification);
                return state;
              });
            },
            markAsRead: (id) => {
              set((state) => {
                state.notifications = state.notifications.map(
                  (notification) => {
                    if (notification.id === id) {
                      return {
                        ...notification,
                        isRead: true,
                        readAt: new Date(),
                      };
                    }
                    return notification;
                  }
                );
                return state;
              });
            },
            markAllAsRead: (ids: string[]) => {
              set((state) => {
                state.notifications = state.notifications.map(
                  (notification) => {
                    if (ids.includes(notification.id)) {
                      return {
                        ...notification,
                        isRead: true,
                        readAt: new Date(),
                      };
                    }
                    return notification;
                  }
                );
                return state;
              });
            },
          })
        )
      ),

      {
        name: "notification-store",
        store: "notification-store",
        enabled: env.NEXT_PUBLIC_NODE_ENV === "development",
      }
    )
  );
}
