import { and, countDistinct, desc, eq } from "drizzle-orm";

import {
  LeadCategoryJoinTable,
  LeadCategoryTable,
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
        totalLeads: countDistinct(LeadCategoryJoinTable.leadId).as(
          "totalLeads"
        ),
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
