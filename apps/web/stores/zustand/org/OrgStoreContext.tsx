"use client";

import { createContext, useContext, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { StoreApi, useStore } from "zustand";

import { orpcTQClient } from "@/server/orpc.client";

import { orgStore, OrgStoreAction, OrgStoreState } from "./orgStore";

const OrgStoreContext = createContext<StoreApi<
  OrgStoreState & OrgStoreAction
> | null>(null);

export function OrgStoreProvider({ children }: { children: React.ReactNode }) {
  const {
    data: {
      data: { orgs, activeOrg, orgRoles },
    },
  } = useSuspenseQuery(
    orpcTQClient.auth.metadata.queryOptions({
      staleTime: Infinity,
    })
  );

  const [store] = useState<StoreApi<OrgStoreState & OrgStoreAction>>(() =>
    orgStore(orgs, activeOrg, orgRoles)
  );

  return (
    <OrgStoreContext.Provider value={store}>
      {children}
    </OrgStoreContext.Provider>
  );
}

export function useOrgStore<T>(
  selector: (state: OrgStoreState & OrgStoreAction) => T
) {
  const store = useContext(OrgStoreContext);
  if (!store) {
    throw new Error("OrgStoreProvider is not found");
  }
  return useStore(store, selector);
}
