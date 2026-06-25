"use client";

import { createContext, useContext, useState } from "react";

import { StoreApi, useStore } from "zustand";

import type { OrganizationDataModel } from "@workspace/drizzle/schemas";

import {
  orgStore,
  OrgStoreAction,
  OrgStoreState,
  StateOrganizationType,
} from "./orgStore";

const OrgStoreContext = createContext<StoreApi<
  OrgStoreState & OrgStoreAction
> | null>(null);

interface OrgStoreProviderProps extends React.PropsWithChildren {
  organizations: Array<StateOrganizationType>;
  activeOrg: OrganizationDataModel | undefined;
  orgRoles: Array<{ id: string; roleName: string }>;
}

export function OrgStoreProvider({
  children,
  organizations,
  activeOrg,
  orgRoles,
}: OrgStoreProviderProps) {
  const [store] = useState<StoreApi<OrgStoreState & OrgStoreAction>>(() =>
    orgStore(organizations, activeOrg, orgRoles)
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
