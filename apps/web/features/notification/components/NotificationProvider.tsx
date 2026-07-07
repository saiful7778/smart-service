"use client";

import { useCallback, useEffect, useMemo } from "react";

import toast from "react-hot-toast";

import { supabaseBrowserClient } from "@/lib/supabase/browser-client";

import { usePageVisibility } from "@/hooks/use-page-visibility";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";
import { useNotificationStore } from "@/stores/zustand/notification/NotificationStoreContext";

import type { ListNotificationOutput } from "../api/notification.contract";
import { chimeSound } from "../data/notification-sound";
import {
  NOTIFICATION_EVENT,
  notificationChannel,
} from "../data/notificationChannel";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = useAuthStore((state) => state.user!);
  const { isVisible } = usePageVisibility();
  const addNotifications = useNotificationStore(
    (state) => state.addNotifications
  );
  const toastId = "notification_toast_message";

  const channelName = useMemo(
    () => notificationChannel(authUser.id),
    [authUser.id]
  );

  const addNotificationToStore = useCallback(
    (notification: ListNotificationOutput["data"][number]) => {
      addNotifications(notification);
      if (isVisible) {
        toast(notification.title, {
          icon: "🔔",
          duration: 5000,
          id: toastId,
        });
        chimeSound()
          .then(() => {})
          .catch(() => {});
      }
    },
    [addNotifications, isVisible]
  );

  useEffect(() => {
    const channel = supabaseBrowserClient
      .channel(channelName)
      .on("broadcast", { event: NOTIFICATION_EVENT }, ({ payload }) => {
        addNotificationToStore(payload);
      })
      .subscribe((status, err) => {
        if (err) {
          toast.error(err.message);
        }
        console.log(status);
      });

    return () => {
      supabaseBrowserClient.removeChannel(channel);
    };
  }, [channelName, addNotificationToStore]);

  return children;
}
