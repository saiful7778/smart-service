"use client";

import { useEffect, useRef, useState } from "react";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClient } from "@tanstack/query-persist-client-core";
import {
  defaultShouldDehydrateQuery,
  onlineManager,
  type QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { del, get, set } from "idb-keyval";

import { createQueryClient } from "@/lib/tanstack/query/query-client";

function setupOnlineManager(queryClient: QueryClient) {
  onlineManager.setEventListener((setOnline) => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  });

  // When connectivity returns
  return onlineManager.subscribe((isOnline) => {
    if (isOnline) {
      queryClient.resumePausedMutations();
    }
  });
}

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient;
  }
}

export default function TanstackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => createQueryClient());
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    window.__TANSTACK_QUERY_CLIENT__ = queryClient;

    const persister = createAsyncStoragePersister({
      storage: { getItem: get, setItem: set, removeItem: del },
      key: "OFFLINE_PWA_QUERY_CACHE",
    });

    const [unsubscribePersist] = persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24, // discard persisted cache after 24h
      buster: "v1",
      dehydrateOptions: {
        shouldDehydrateQuery: defaultShouldDehydrateQuery,
      },
    });

    const unsubscribeOnline = setupOnlineManager(queryClient);

    return () => {
      mountedRef.current = false;
      unsubscribePersist();
      unsubscribeOnline();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
