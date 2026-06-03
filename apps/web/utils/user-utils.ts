import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import {
  RoleEnumSchema,
  RoleEnumType,
  RoleTypeEnumType,
} from "@workspace/drizzle/zod-db-enums";

import {
  hasPermission,
  hasPermissionWithOrg,
  PermissionType,
} from "@/lib/permission";

import { DEFAULT_AUTH_PATH } from "@/constants";
import {
  getAuthUserWithRolesAndPermissionsCache,
  getAuthUserWithRolesAndPermissionsWithContextCache,
} from "@/features/auth/data/getAuthUser";

export function isAdmin(
  roles: Array<{ roleName: RoleEnumType; source: RoleTypeEnumType }>
) {
  return roles.some(
    ({ roleName }) =>
      roleName === RoleEnumSchema.enum.SYSTEM_ADMIN ||
      roleName === RoleEnumSchema.enum.SUPER_ADMIN
  );
}

export const requireUserPermissionsCache = cache(
  async (inputPermissions: Array<PermissionType>, resourceId?: string) => {
    const { session, user, permissions } =
      await getAuthUserWithRolesAndPermissionsCache();

    if (
      !hasPermission(permissions, inputPermissions, {
        userId: user.id,
        resourceId,
      })
    ) {
      return redirect(DEFAULT_AUTH_PATH);
    }

    return {
      session,
      user,
    };
  }
);

export const requireUserPermissionsWithOrgCache = cache(
  async (inputPermissions: Array<PermissionType>, resourceId?: string) => {
    const { session, user, permissions } =
      await getAuthUserWithRolesAndPermissionsWithContextCache();

    if (
      !hasPermissionWithOrg(permissions, inputPermissions, {
        orgId: session?.activeOrganizationId,
        userId: user.id,
        resourceId,
      })
    ) {
      return redirect(DEFAULT_AUTH_PATH);
    }

    return {
      session,
      user,
    };
  }
);
