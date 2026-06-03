import { createStore } from "zustand";
import { combine, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { OrganizationDataModel } from "@workspace/drizzle/schemas";

import { env } from "@/lib/env";

export type StateOrganizationType = OrganizationDataModel & {
  memberRole: string;
  joinedAt: Date;
};

export type StateActiveOrgType = OrganizationDataModel;

export interface OrgStoreState {
  organizations: Array<StateOrganizationType>;
  activeOrg: StateActiveOrgType | undefined;
}

export interface OrgStoreAction {
  setActiveOrg: (activeOrg: StateActiveOrgType) => void;
  clearAllData: () => void;
}

export function orgStore(
  organizations: Array<StateOrganizationType>,
  activeOrg: StateActiveOrgType | undefined
) {
  return createStore<OrgStoreState & OrgStoreAction>()(
    devtools(
      immer(
        combine<OrgStoreState, OrgStoreAction>(
          { organizations, activeOrg },
          (set) => ({
            setActiveOrg: (activeOrg) => {
              set((state) => {
                state.activeOrg = activeOrg;
                return state;
              });
            },
            clearAllData: () => {
              set((state) => {
                state.organizations = [];
                state.activeOrg = undefined;
                return state;
              });
            },
          })
        )
      ),

      {
        name: "org-store",
        store: "org-store",
        enabled: env.NEXT_PUBLIC_NODE_ENV === "development",
      }
    )
  );
}
