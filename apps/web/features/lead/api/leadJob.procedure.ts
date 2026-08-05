import { and, eq, isNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  JobTable,
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

export const listLeadJobsProcedure = leadImpl.job.list
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.list"]))
  .handler(async ({ context, input, errors }) => {
    const [existLead] = await context.db
      .select({ id: LeadTable.id })
      .from(LeadTable)
      .where(and(eq(LeadTable.id, input.leadId), isNull(LeadTable.deletedAt)))
      .limit(1);

    if (!existLead) {
      throw errors.NOT_FOUND();
    }

    const { page, limit, offset, where, orderBy } = buildPaginateOptions(
      {
        title: JobTable.title,
        status: JobTable.status,
        createdAt: JobTable.createdAt,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: JobTable.id,
        leadId: JobTable.leadId,
        title: JobTable.title,
        description: JobTable.description,
        status: JobTable.status,
        createdAt: JobTable.createdAt,
        receivedRevenue: JobTable.receivedRevenue,
        expectedRevenue: JobTable.expectedRevenue,
        invoicedRevenue: JobTable.invoicedRevenue,
        createdBy: userProfileColumns,
      })
      .from(JobTable)
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, JobTable.createdBy)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(OrgMemberRoleTable.roleId, RoleTable.id))
      .where(
        and(
          eq(JobTable.orgId, context.org.id),
          eq(JobTable.leadId, existLead.id),
          isNull(JobTable.deletedAt),
          where
        )
      )
      .groupBy(
        JobTable.id,
        OrganizationMemberTable.id,
        UserTable.id,
        RoleTable.id
      );

    const [totalCount, jobs] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: JobTable.id })
          .from(JobTable)
          .where(
            and(
              eq(JobTable.orgId, context.org.id),
              eq(JobTable.leadId, existLead.id),
              isNull(JobTable.deletedAt)
            )
          )
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, jobs.length, page, limit);

    return apiResponse(API_MESSAGES.JOB.GET_ALL, {
      meta,
      data: jobs,
    });
  });
