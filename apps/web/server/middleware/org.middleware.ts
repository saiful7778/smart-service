import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  OrganizationDataModel,
  OrganizationMemberTable,
  OrganizationTable,
  OrgMemberDataModel,
} from "@workspace/drizzle/schemas";
import { OrgRoleType } from "@workspace/lib/utils";

import { hasPermissionWithOrg, PermissionType } from "@/lib/permission";

import { API_MESSAGES } from "@/constants/apiMessage";
import { ORPCContext } from "@/types/orpc.types";

import { baseOs } from "../orpc.base";
import {
  getAuthData,
  getRolesAndPermissionsWithContext,
  validateRoles,
} from "./auth.middleware";

const ORG_ERRORS = {
  NO_ACTIVE_ORGANIZATION: {
    message: API_MESSAGES.ORG.NO_ACTIVE_ORGANIZATION,
  },
  NO_PERMISSION: {
    message: API_MESSAGES.ORG.NO_PERMISSION,
  },
} as const;

async function getOrg(
  orgId: string,
  database: DatabaseType
): Promise<OrganizationDataModel | null> {
  const [org] = await database
    .select()
    .from(OrganizationTable)
    .where(eq(OrganizationTable.id, orgId))
    .limit(1);

  if (!org) return null;

  return org;
}

async function getOrgMember(
  orgId: string,
  userId: string,
  database: DatabaseType
): Promise<OrgMemberDataModel | null> {
  const [orgMember] = await database
    .select()
    .from(OrganizationMemberTable)
    .where(
      and(
        eq(OrganizationMemberTable.userId, userId),
        eq(OrganizationMemberTable.organizationId, orgId)
      )
    )
    .limit(1);

  if (!orgMember) return null;

  return orgMember;
}

async function getActiveOrganization(
  context: ORPCContext
): Promise<OrganizationDataModel | null> {
  try {
    if (context.session === null || context.user === null) return null;

    const activeOrganizationId = context.session.activeOrganizationId;

    if (!activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", ORG_ERRORS.NO_ACTIVE_ORGANIZATION);
    }

    const org = await getOrg(activeOrganizationId, context.db);

    if (!org) {
      throw new ORPCError("BAD_REQUEST", ORG_ERRORS.NO_ACTIVE_ORGANIZATION);
    }

    return org;
  } catch (err) {
    if (err instanceof ORPCError) throw err;
    context.logger.error({ err }, "Error getting active organization");
    return null;
  }
}

export const orgMiddleware = baseOs.middleware(
  async ({ context, errors, next }) => {
    const authData = await getAuthData(context);

    if (!authData) throw errors.UNAUTHORIZED();

    const org = await getActiveOrganization(context);

    if (!org) throw errors.UNAUTHORIZED();

    const orgMember = await getOrgMember(org.id, authData.user.id, context.db);

    if (!orgMember) throw errors.UNAUTHORIZED();

    return next({
      context: {
        org,
        orgMember,
        session: authData.session,
        user: authData.user,
      },
    });
  }
);

export function orgMemberRoleMiddleware(roles: Array<OrgRoleType>) {
  return baseOs.middleware(async ({ context, errors, next }) => {
    const authData = await getAuthData(context);

    if (!authData) {
      throw errors.UNAUTHORIZED();
    }

    const rolesAndPermissions = await getRolesAndPermissionsWithContext(
      authData.user.id,
      context
    );

    if (!rolesAndPermissions) {
      throw errors.UNAUTHORIZED();
    }

    if (!validateRoles(roles, rolesAndPermissions.roles)) {
      throw errors.FORBIDDEN();
    }

    const org = await getActiveOrganization(context);

    if (!org) throw errors.UNAUTHORIZED();

    const orgMember = await getOrgMember(org.id, authData.user.id, context.db);

    if (!orgMember) throw errors.UNAUTHORIZED();

    return next({
      context: {
        org,
        orgMember,
        session: authData.session,
        user: authData.user,
        roles: rolesAndPermissions.roles,
        permissions: rolesAndPermissions.permissions,
      },
    });
  });
}

export function orgMemberPermissionsMiddleware(
  permissions: Array<PermissionType>
) {
  return baseOs.middleware(async ({ context, errors, next }) => {
    const authData = await getAuthData(context);

    if (!authData) {
      throw errors.UNAUTHORIZED();
    }

    const rolesAndPermissions = await getRolesAndPermissionsWithContext(
      authData.user.id,
      context
    );

    if (!rolesAndPermissions) {
      throw errors.UNAUTHORIZED();
    }

    if (
      !hasPermissionWithOrg(rolesAndPermissions.permissions, permissions, {
        userId: authData.user.id,
        orgId: authData.session.activeOrganizationId,
      })
    ) {
      throw errors.FORBIDDEN();
    }

    const org = await getActiveOrganization(context);

    if (!org) throw errors.UNAUTHORIZED();

    const orgMember = await getOrgMember(org.id, authData.user.id, context.db);

    if (!orgMember) throw errors.UNAUTHORIZED();

    return next({
      context: {
        org,
        orgMember,
        session: authData.session,
        user: authData.user,
        roles: rolesAndPermissions.roles,
        permissions: rolesAndPermissions.permissions,
      },
    });
  });
}
