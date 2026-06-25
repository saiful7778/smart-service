import { implement, ORPCError } from "@orpc/server";
import { and, eq, inArray } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  AddressTable,
  InsertAddress,
  InsertOrgAddress,
  InvitationTable,
  OrgAddressTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  OrgRoleMemberTable,
  OrgRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import {
  apiResponse,
  OrgRoleEnumSchema,
  OrgRoleType,
} from "@workspace/lib/utils";

import { auth } from "@/lib/better-auth/auth";
import { env } from "@/lib/env";
import { mailProvider } from "@/lib/mail";

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

    const org = await context.db.transaction(async (tx) => {
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

      await mailProvider.sendOrgCreateWelcomeMail({
        to: context.user.email,
        tenantName: org.name,
        adminName: context.user.name,
        dashboardUrl: `${env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      });

      if (input.logoKey) {
        await assignFileEntityByFileKey(
          input.logoKey,
          {
            entityType: "organization",
            entityId: org.id,
          },
          tx
        );
      }

      const [address] = await tx
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

      await tx.insert(OrgAddressTable).values({
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

      return org;
    });

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
      .select({
        userId: UserTable.id,
        orgMemberId: OrganizationMemberTable.id,
        name: UserTable.name,
        email: UserTable.email,
        image: UserTable.image,
      })
      .from(OrganizationMemberTable)
      .innerJoin(UserTable, eq(OrganizationMemberTable.userId, UserTable.id))
      .where(
        and(eq(OrganizationMemberTable.organizationId, context.org.id), where)
      )
      .groupBy(UserTable.id, OrganizationMemberTable.id)
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

    const memberIds = members.map((m) => m.orgMemberId);

    const [systemOrgRoles, customOrgRoles] = await Promise.all([
      context.db
        .select({
          memberId: OrgMemberRoleTable.memberId,
          id: RoleTable.id,
          roleName: RoleTable.roleName,
        })
        .from(OrgMemberRoleTable)
        .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
        .where(inArray(OrgMemberRoleTable.memberId, memberIds)),
      context.db
        .select({
          memberId: OrgRoleMemberTable.memberId,
          id: OrgRoleTable.id,
          roleName: OrgRoleTable.role,
        })
        .from(OrgRoleMemberTable)
        .innerJoin(OrgRoleTable, eq(OrgRoleTable.id, OrgRoleMemberTable.roleId))
        .where(inArray(OrgRoleMemberTable.memberId, memberIds)),
    ]);

    const rolesMap = new Map<string, Array<{ id: string; roleName: string }>>();

    systemOrgRoles.forEach((role) => {
      const exist = rolesMap.get(role.memberId);
      if (exist) {
        exist.push({ id: role.id, roleName: role.roleName });
      } else {
        rolesMap.set(role.memberId, [{ id: role.id, roleName: role.roleName }]);
      }
    });

    customOrgRoles.forEach((role) => {
      const exist = rolesMap.get(role.memberId);
      if (exist) {
        exist.push({ id: role.id, roleName: role.roleName });
      } else {
        rolesMap.set(role.memberId, [{ id: role.id, roleName: role.roleName }]);
      }
    });

    return apiResponse(API_MESSAGES.ORG.LIST_MEMBERS, {
      meta,
      data: members.map((member) => ({
        ...member,
        roles: rolesMap.get(member.orgMemberId) || [],
      })),
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
    let roleData: { id: string; roleName: OrgRoleType | string } | undefined =
      undefined;

    if (OrgRoleEnumSchema.safeParse(input.roleName).success) {
      [roleData] = await context.db
        .select({
          id: RoleTable.id,
          roleName: RoleTable.roleName,
        })
        .from(RoleTable)
        .where(eq(RoleTable.roleName, input.roleName as OrgRoleType))
        .limit(1);
    } else {
      [roleData] = await context.db
        .select({
          id: OrgRoleTable.id,
          roleName: OrgRoleTable.role,
        })
        .from(OrgRoleTable)
        .where(eq(OrgRoleTable.role, input.roleName))
        .limit(1);
    }

    if (!roleData) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.ROLE.NOT_FOUND,
      });
    }

    await auth.api.createInvitation({
      body: {
        email: input.email,
        role: roleData.roleName as OrgRoleType,
        organizationId: context.org.id,
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
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(OrgMemberRoleTable.roleId, RoleTable.id))
      .where(
        and(eq(OrganizationMemberTable.organizationId, context.org.id), where)
      );

    return apiResponse(API_MESSAGES.ORG.LIST_MEMBERS_FOR_SEARCH, members);
  });

export const updateMemberProcedure = orgImpl.updateMember
  .use(orgMemberPermissionsMiddleware(["org.user.manage", "org.user.update"]))
  .handler(async ({ input, context }) => {
    const [member] = await context.db
      .select()
      .from(OrganizationMemberTable)
      .where(
        and(
          eq(OrganizationMemberTable.id, input.memberId),
          eq(OrganizationMemberTable.organizationId, context.org.id)
        )
      )
      .limit(1);

    if (!member) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.ORG.MEMBER.NOT_FOUND,
      });
    }

    const rolesData: Array<{
      id: string;
      roleName: OrgRoleType | string;
      type: "custom" | "system";
    }> = [];

    await Promise.all(
      input.roleNames.map(async (roleName) => {
        if (OrgRoleEnumSchema.safeParse(roleName.value).success) {
          const [roleData] = await context.db
            .select({
              id: RoleTable.id,
              roleName: RoleTable.roleName,
            })
            .from(RoleTable)
            .where(eq(RoleTable.roleName, roleName.value as OrgRoleType))
            .limit(1);

          if (!roleData) {
            throw new ORPCError("BAD_REQUEST", {
              message: API_MESSAGES.ROLE.NOT_FOUND,
            });
          }

          rolesData.push({
            id: roleData.id,
            roleName: roleData.roleName,
            type: "system",
          });
        } else {
          const [roleData] = await context.db
            .select({
              id: OrgRoleTable.id,
              roleName: OrgRoleTable.role,
            })
            .from(OrgRoleTable)
            .where(eq(OrgRoleTable.role, roleName.value))
            .limit(1);

          if (!roleData) {
            throw new ORPCError("BAD_REQUEST", {
              message: API_MESSAGES.ROLE.NOT_FOUND,
            });
          }

          rolesData.push({
            id: roleData.id,
            roleName: roleData.roleName,
            type: "custom",
          });
        }
      })
    );

    const updatedMember = await context.db.transaction(async (tx) => {
      const [updatedMember] = await tx
        .update(OrganizationMemberTable)
        .set({
          role: rolesData.map((role) => role.roleName).join(","),
        })
        .where(
          and(
            eq(OrganizationMemberTable.id, input.memberId),
            eq(OrganizationMemberTable.organizationId, context.org.id)
          )
        )
        .returning();

      if (!updatedMember) {
        throw new ORPCError("BAD_REQUEST", {
          message: API_MESSAGES.ORG.MEMBER.NOT_UPDATED,
        });
      }

      const systemOrgRoles = rolesData.filter((role) => role.type === "system");
      const customOrgRoles = rolesData.filter((role) => role.type === "custom");

      await Promise.all([
        tx
          .delete(OrgMemberRoleTable)
          .where(eq(OrgMemberRoleTable.memberId, input.memberId)),
        tx
          .delete(OrgRoleMemberTable)
          .where(eq(OrgRoleMemberTable.memberId, input.memberId)),
      ]);

      const insertPromises: Array<Promise<unknown>> = [];

      if (systemOrgRoles.length > 0) {
        insertPromises.push(
          tx.insert(OrgMemberRoleTable).values(
            systemOrgRoles.map((role) => ({
              memberId: input.memberId,
              roleId: role.id,
              orgId: context.org.id,
            }))
          )
        );
      }

      if (customOrgRoles.length > 0) {
        insertPromises.push(
          tx.insert(OrgRoleMemberTable).values(
            customOrgRoles.map((role) => ({
              memberId: input.memberId,
              roleId: role.id,
              orgId: context.org.id,
            }))
          )
        );
      }

      if (insertPromises.length > 0) {
        await Promise.all(insertPromises);
      }

      return updatedMember;
    });

    return apiResponse(API_MESSAGES.ORG.MEMBER.UPDATE, updatedMember);
  });

export const listInvitationProcedure = orgImpl.listInvitation
  .use(
    orgMemberPermissionsMiddleware([
      "org.invitation.manage",
      "org.invitation.list",
    ])
  )
  .handler(async ({ input, context }) => {
    const { where, orderBy, limit, offset, page } = buildPaginateOptions(
      {
        email: InvitationTable.email,
        role: InvitationTable.role,
        status: InvitationTable.status,
        createdAt: InvitationTable.createdAt,
      },
      input
    );

    const baseQuery = context.db
      .select({
        id: InvitationTable.id,
        email: InvitationTable.email,
        teamId: InvitationTable.teamId,
        role: InvitationTable.role,
        status: InvitationTable.status,
        createdAt: InvitationTable.createdAt,
        expiresAt: InvitationTable.expiresAt,
        inviter: userProfileColumns,
      })
      .from(InvitationTable)
      .innerJoin(UserTable, eq(InvitationTable.inviterId, UserTable.id))
      .innerJoin(
        OrganizationMemberTable,
        and(
          eq(OrganizationMemberTable.userId, UserTable.id),
          eq(OrganizationMemberTable.organizationId, context.org.id)
        )
      )
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(OrgMemberRoleTable.roleId, RoleTable.id))
      .where(and(eq(InvitationTable.organizationId, context.org.id), where))
      .groupBy(InvitationTable.id, UserTable.id, OrganizationMemberTable.id)
      .$dynamic();

    const [totalCount, invitations] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: InvitationTable.id })
          .from(InvitationTable)
          .where(eq(InvitationTable.organizationId, context.org.id))
      ),
      baseQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(
      totalCount,
      invitations.length,
      page,
      limit
    );

    return apiResponse(API_MESSAGES.ORG.INVITATION.GET_ALL, {
      meta,
      data: invitations,
    });
  });

export const updateInvitationProcedure = orgImpl.updateInvitation
  .use(
    orgMemberPermissionsMiddleware([
      "org.invitation.manage",
      "org.invitation.update",
    ])
  )
  .handler(async ({ input, context }) => {
    const [exist] = await context.db
      .select({
        id: InvitationTable.id,
        status: InvitationTable.status,
        expiresAt: InvitationTable.expiresAt,
      })
      .from(InvitationTable)
      .where(
        and(
          eq(InvitationTable.id, input.invitationId),
          eq(InvitationTable.organizationId, context.org.id)
        )
      )
      .limit(1);

    if (!exist) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.ORG.INVITATION.NOT_FOUND,
      });
    }

    if (exist.status !== "pending") {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.ORG.INVITATION.NOT_PENDING,
      });
    }

    if (exist.expiresAt < new Date()) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.ORG.INVITATION.NOT_ACTIVE,
      });
    }

    const [invitation] = await context.db
      .update(InvitationTable)
      .set({
        role: input.role,
      })
      .where(
        and(
          eq(InvitationTable.id, input.invitationId),
          eq(InvitationTable.organizationId, context.org.id)
        )
      )
      .returning();

    if (!invitation) {
      throw new ORPCError("NOT_UPDATED", {
        message: API_MESSAGES.ORG.INVITATION.NOT_UPDATED,
      });
    }

    return apiResponse(API_MESSAGES.ORG.INVITATION.UPDATE, invitation);
  });

export const deleteInvitationProcedure = orgImpl.deleteInvitation
  .use(
    orgMemberPermissionsMiddleware([
      "org.invitation.manage",
      "org.invitation.delete",
    ])
  )
  .handler(async ({ input, context }) => {
    const [invitation] = await context.db
      .select({
        id: InvitationTable.id,
      })
      .from(InvitationTable)
      .where(
        and(
          eq(InvitationTable.id, input.invitationId),
          eq(InvitationTable.organizationId, context.org.id)
        )
      )
      .limit(1);

    if (!invitation) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.ORG.INVITATION.NOT_FOUND,
      });
    }

    await context.db
      .delete(InvitationTable)
      .where(eq(InvitationTable.id, invitation.id));

    return apiResponse(API_MESSAGES.ORG.INVITATION.DELETE, null);
  });
