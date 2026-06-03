import { implement, ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  AddressTable,
  InsertAddress,
  InsertOrgAddress,
  OrgAddressTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { auth } from "@/lib/better-auth/auth";

import { API_MESSAGES } from "@/constants/apiMessage";
import { assignFileEntityByFileKey } from "@/features/upload/assignFileEntity";
import { userProfileColumns } from "@/features/user/user.api-schema";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { loggerMiddleware } from "@/server/middleware/logger.middleware";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { orgContract } from "./org.contract";

export const orgImpl = implement(orgContract)
  .$context<ORPCContext>()
  .use(loggerMiddleware)
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const createOrgProcedure = orgImpl.create
  .use(userPermissionMiddleware(["self.org.create"]))
  .handler(async ({ context, input }) => {
    if (context.user.id !== input.userId) {
      context.logger.error(API_MESSAGES.USER.NOT_MATCHED);
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.USER.NOT_MATCHED,
      });
    }

    const org = await auth.api.createOrganization({
      body: {
        name: input.name,
        slug: input.slug,
        logo: input.logoUrl,
        userId: context.user.id,
        email: input.email,
        phone: input.phone,
        keepCurrentActiveOrganization: false,
      },
      headers: context.reqHeaders,
    });
    context.logger.info(API_MESSAGES.ORG.CREATE);

    if (input.logoKey) {
      await assignFileEntityByFileKey(
        input.logoKey,
        {
          entityType: "organization",
          entityId: org.id,
        },
        context.db
      );
    }

    const [address] = await context.db
      .insert(AddressTable)
      .values({
        line1: input.line1,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        latitude: input.latitude,
        longitude: input.longitude,
        placeId: input.placeId,
      } as InsertAddress)
      .returning({ id: AddressTable.id });

    await context.db.insert(OrgAddressTable).values({
      orgId: org.id,
      addressId: address!.id,
      isPrimary: true,
    } as InsertOrgAddress);

    await auth.api.setActiveOrganization({
      body: {
        organizationId: org.id,
      },
      headers: context.reqHeaders,
    });
    context.logger.info(API_MESSAGES.ORG.ACTIVATED);

    return apiResponse(API_MESSAGES.ORG.CREATE, {
      id: org.id,
      name: org.name,
      slug: org.slug,
    });
  });

export const listMemberProcedure = orgImpl.listMember
  .use(orgMemberPermissionsMiddleware(["org.user.manage", "org.user.list"]))
  .handler(async ({ input, context }) => {
    const { where, orderBy, limit, offset, page } = buildPaginateOptions(
      {
        name: UserTable.name,
        email: UserTable.email,
        roleName: RoleTable.roleName,
        createdAt: OrganizationMemberTable.createdAt,
      },
      input
    );

    const joinedQuery = context.db
      .select(userProfileColumns)
      .from(OrganizationMemberTable)
      .innerJoin(UserTable, eq(OrganizationMemberTable.userId, UserTable.id))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.orgMemberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(OrgMemberRoleTable.roleId, RoleTable.id))
      .where(
        and(eq(OrganizationMemberTable.organizationId, context.org.id), where)
      )
      .$dynamic();

    const [totalCount, members] = await Promise.all([
      context.db.$count(
        context.db
          .select({
            id: OrganizationMemberTable.id,
          })
          .from(OrganizationMemberTable)
          .where(eq(OrganizationMemberTable.organizationId, context.org.id))
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, members.length, page, limit);

    return apiResponse(API_MESSAGES.ORG.LIST_MEMBERS, {
      meta,
      data: members,
    });
  });

export const inviteMemberProcedure = orgImpl.inviteMember
  .use(
    orgMemberPermissionsMiddleware([
      "org.invitation.manage",
      "org.invitation.create",
    ])
  )
  .handler(async ({ input, context }) => {
    if (input.organizationId !== context.org.id) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.ORG.NOT_MATCHED,
      });
    }

    const [role] = await context.db
      .select({ id: RoleTable.id })
      .from(RoleTable)
      .where(and(eq(RoleTable.roleName, input.role), eq(RoleTable.type, "ORG")))
      .limit(1);

    if (!role) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.USER.ROLE.NOT_FOUND,
      });
    }

    await auth.api.createInvitation({
      body: {
        email: input.email,
        role: input.role,
        organizationId: input.organizationId,
        resend: true,
      },
      headers: context.reqHeaders,
    });

    return apiResponse(API_MESSAGES.ORG.INVITE_MEMBER, null);
  });

export const acceptOrRejectInvitationProcedure =
  orgImpl.acceptOrRejectInvitation.handler(async ({ input, context }) => {
    if (input.action === "accept") {
      const { member } = await auth.api.acceptInvitation({
        body: {
          invitationId: input.invitationId,
        },
        headers: context.reqHeaders,
      });

      await auth.api.setActiveOrganization({
        body: {
          organizationId: member.organizationId,
        },
        headers: context.reqHeaders,
      });
    } else {
      await auth.api.rejectInvitation({
        body: {
          invitationId: input.invitationId,
        },
        headers: context.reqHeaders,
      });
    }

    return apiResponse(
      input.action === "accept"
        ? API_MESSAGES.ORG.INVITATION.ACCEPT
        : API_MESSAGES.ORG.INVITATION.REJECT,
      null
    );
  });

export const listMemberForSearchProcedure = orgImpl.listMemberForSearch
  .use(orgMemberPermissionsMiddleware(["org.user.manage", "org.user.list"]))
  .handler(async ({ input, context }) => {
    const { where } = buildPaginateOptions(
      {
        name: UserTable.name,
        email: UserTable.email,
      },
      input
    );

    const members = await context.db
      .select(userProfileColumns)
      .from(OrganizationMemberTable)
      .innerJoin(UserTable, eq(OrganizationMemberTable.userId, UserTable.id))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.orgMemberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(OrgMemberRoleTable.roleId, RoleTable.id))
      .where(
        and(eq(OrganizationMemberTable.organizationId, context.org.id), where)
      );

    return apiResponse(API_MESSAGES.ORG.LIST_MEMBERS_FOR_SEARCH, members);
  });
