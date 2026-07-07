"use client";

import { createContext, useContext, useState } from "react";

import { StoreApi, useStore } from "zustand";

import { ListNotificationOutput } from "@/features/notification/api/notification.contract";
import {
  notificationStore,
  type NotificationStoreAction,
  type NotificationStoreState,
} from "@/stores/zustand/notification/notificationStore";

const NotificationStoreContext = createContext<StoreApi<
  NotificationStoreState & NotificationStoreAction
> | null>(null);

interface NotificationStoreContextProviderProps {
  children: React.ReactNode;
  initialNotifications: ListNotificationOutput["data"];
}

export function NotificationStoreContextProvider({
  children,
  initialNotifications,
}: NotificationStoreContextProviderProps) {
  const [store] = useState<
    StoreApi<NotificationStoreState & NotificationStoreAction>
  >(() => notificationStore(initialNotifications));

  return (
    <NotificationStoreContext.Provider value={store}>
      {children}
    </NotificationStoreContext.Provider>
  );
}

export function useNotificationStore<T>(
  selector: (state: NotificationStoreState & NotificationStoreAction) => T
) {
  const store = useContext(NotificationStoreContext);
  if (!store) {
    throw new Error("NotificationStoreProvider is not found");
  }
  return useStore(store, selector);
}
