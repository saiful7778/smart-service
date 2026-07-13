"use client";

import {
  hasPermission,
  hasPermissionWithOrg,
  PermissionType,
} from "@/lib/permission";

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";
import { useOrgStore } from "@/stores/zustand/org/OrgStoreContext";

export function usePermissionCheckWithOrg(permissions: Array<PermissionType>) {
  const userPermissions = useAuthStore((state) => state.permissions);
  const authUser = useAuthStore((state) => state.user!);
  const activeOrg = useOrgStore((state) => state.activeOrg!);

  const isAllowd = hasPermissionWithOrg(userPermissions, permissions, {
    orgId: activeOrg.id,
    userId: authUser.id,
  });

  return isAllowd;
}

export function usePermissionCheck(permissions: Array<PermissionType>) {
  const userPermissions = useAuthStore((state) => state.permissions);
  const authUser = useAuthStore((state) => state.user!);

  const isAllowd = hasPermission(userPermissions, permissions, {
    userId: authUser.id,
  });

  return isAllowd;
}
