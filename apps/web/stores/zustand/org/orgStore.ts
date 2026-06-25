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
  orgRoles: Array<{ id: string; roleName: string }>;
}

export interface OrgStoreAction {
  setActiveOrg: (activeOrg: StateActiveOrgType) => void;
  clearAllData: () => void;
  addOrgRole: (id: string, roleName: string) => void;
  updateOrgRole: (id: string, roleName: string) => void;
  deleteOrgRole: (id: string) => void;
}

export function orgStore(
  organizations: Array<StateOrganizationType>,
  activeOrg: StateActiveOrgType | undefined,
  orgRoles: Array<{ id: string; roleName: string }>
) {
  return createStore<OrgStoreState & OrgStoreAction>()(
    devtools(
      immer(
        combine<OrgStoreState, OrgStoreAction>(
          { organizations, activeOrg, orgRoles },
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
            addOrgRole: (id, roleName) => {
              set((state) => {
                state.orgRoles.push({ id, roleName });
                return state;
              });
            },
            updateOrgRole: (id, roleName) => {
              set((state) => {
                const role = state.orgRoles.find((role) => role.id === id);
                if (role) {
                  role.roleName = roleName;
                }
                return state;
              });
            },
            deleteOrgRole: (id) => {
              set((state) => {
                state.orgRoles = state.orgRoles.filter(
                  (role) => role.id !== id
                );
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
