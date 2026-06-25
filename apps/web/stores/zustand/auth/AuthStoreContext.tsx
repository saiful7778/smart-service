"use client";

import { createContext, useContext, useState } from "react";

import { StoreApi, useStore } from "zustand";

import type {
  AuthSession,
  AuthUser,
  PermissionWithOrg,
  RoleWithOrg,
} from "@/types";

import { authStore, AuthStoreAction, AuthStoreState } from "./authStore";

const AuthStoreContext = createContext<StoreApi<
  AuthStoreState & AuthStoreAction
> | null>(null);

interface AuthStoreProviderProps extends React.PropsWithChildren {
  user: AuthUser;
  session: AuthSession;
  roles: Array<RoleWithOrg>;
  permissions: Array<PermissionWithOrg>;
}

export function AuthStoreProvider({
  children,
  user,
  session,
  roles,
  permissions,
}: AuthStoreProviderProps) {
  const [store] = useState<StoreApi<AuthStoreState & AuthStoreAction>>(() =>
    authStore(user, session, roles, permissions)
  );

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
}

export function useAuthStore<T>(
  selector: (state: AuthStoreState & AuthStoreAction) => T
) {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error("AuthStoreProvider is not found");
  }
  return useStore(store, selector);
}
