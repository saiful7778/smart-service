import { ORPCError } from "@orpc/client";
import { and, countDistinct, desc, eq, isNull } from "drizzle-orm";

import {
  InsertLeadCategory,
  LeadCategoryJoinTable,
  LeadCategoryTable,
  LeadTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileColumns } from "@/features/user/user.api-schema";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";

import { leadImpl } from "./lead.procedure";

export const listLeadCategoriesProcedure = leadImpl.category.list
  .use(
    orgMemberPermissionsMiddleware([
      "org.lead_category.manage",
      "org.lead_category.list",
    ])
  )
  .handler(async ({ context }) => {
    const leadCategories = await context.db
      .select({
        id: LeadCategoryTable.id,
        name: LeadCategoryTable.name,
        description: LeadCategoryTable.description,
        slug: LeadCategoryTable.slug,
        createdAt: LeadCategoryTable.createdAt,
        updatedAt: LeadCategoryTable.updatedAt,
        totalLeads: countDistinct(LeadTable.id).as("totalLeads"),
        createdBy: userProfileColumns,
      })
      .from(LeadCategoryTable)
      .innerJoin(
        OrganizationMemberTable,
        and(
          eq(LeadCategoryTable.createdBy, OrganizationMemberTable.id),
          eq(OrganizationMemberTable.organizationId, context.org.id)
        )
      )
      .innerJoin(UserTable, eq(OrganizationMemberTable.userId, UserTable.id))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(OrgMemberRoleTable.roleId, RoleTable.id))
      .leftJoin(
        LeadCategoryJoinTable,
        eq(LeadCategoryTable.id, LeadCategoryJoinTable.leadCategoryId)
      )
      .leftJoin(
        LeadTable,
        and(
          eq(LeadTable.id, LeadCategoryJoinTable.leadId),
          isNull(LeadTable.deletedAt)
        )
      )
      .where(eq(LeadCategoryTable.orgId, context.org.id))
      .groupBy(
        LeadCategoryTable.id,
        OrganizationMemberTable.id,
        UserTable.id,
        RoleTable.id
      )
      .orderBy(desc(LeadCategoryTable.createdAt));

    return apiResponse(API_MESSAGES.LEAD.CATEGORY.GET_ALL, leadCategories);
  });

export const listLeadCategoriesForSearchProcedure =
  leadImpl.category.listForSearch
    .use(
      orgMemberPermissionsMiddleware([
        "org.lead_category.manage",
        "org.lead_category.list",
      ])
    )
    .handler(async ({ context }) => {
      const leadCategories = await context.db
        .select({
          id: LeadCategoryTable.id,
          name: LeadCategoryTable.name,
          slug: LeadCategoryTable.slug,
          createdAt: LeadCategoryTable.createdAt,
          updatedAt: LeadCategoryTable.updatedAt,
          totalLeads: countDistinct(LeadTable.id).as("totalLeads"),
        })
        .from(LeadCategoryTable)
        .leftJoin(
          LeadCategoryJoinTable,
          eq(LeadCategoryTable.id, LeadCategoryJoinTable.leadCategoryId)
        )
        .leftJoin(
          LeadTable,
          and(
            eq(LeadTable.id, LeadCategoryJoinTable.leadId),
            isNull(LeadTable.deletedAt)
          )
        )
        .where(eq(LeadCategoryTable.orgId, context.org.id))
        .groupBy(LeadCategoryTable.id);

      return apiResponse(API_MESSAGES.LEAD.CATEGORY.GET_ALL, leadCategories);
    });

export const leadCategoryCreateProcedure = leadImpl.category.create
  .use(
    orgMemberPermissionsMiddleware([
      "org.lead_category.manage",
      "org.lead_category.create",
    ])
  )
  .handler(async ({ context, input }) => {
    const [leadCategory] = await context.db
      .insert(LeadCategoryTable)
      .values({
        ...input,
        createdBy: context.orgMember.id,
        orgId: context.org.id,
      } satisfies InsertLeadCategory)
      .returning();

    if (!leadCategory) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.LEAD.CATEGORY.NOT_CREATED,
      });
    }

    return apiResponse(API_MESSAGES.LEAD.CATEGORY.CREATE, leadCategory);
  });
