"use client";

import { createContext, useContext, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { StoreApi, useStore } from "zustand";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { orpcTQClient } from "@/server/orpc.client";
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
}

export function NotificationStoreContextProvider({
  children,
}: NotificationStoreContextProviderProps) {
  const {
    data: {
      data: { data: notifications },
    },
  } = useSuspenseQuery(
    orpcTQClient.notification.list.queryOptions({
      input: {
        page: DEFAULT_PAGE_INDEX,
        limit: DEFAULT_PAGE_SIZE,
      },
    })
  );

  const [store] = useState<
    StoreApi<NotificationStoreState & NotificationStoreAction>
  >(() => notificationStore(notifications));

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
