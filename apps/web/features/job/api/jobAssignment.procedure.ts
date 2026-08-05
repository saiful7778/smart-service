import { and, eq, isNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  JobScheduleAssignementTable,
  JobScheduleTable,
  JobTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileColumns } from "@/features/user/user.api-schema";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";

import { jobImpl } from "./job.procedure";

export const listJobAssignmentsProcedure = jobImpl.assignment.list
  .use(
    orgMemberPermissionsMiddleware(["org.schedule.manage", "org.schedule.list"])
  )
  .handler(async ({ context, input, errors }) => {
    const [existJob] = await context.db
      .select({ id: JobTable.id })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.orgId, context.org.id),
          eq(JobTable.id, input.jobId),
          isNull(JobTable.deletedAt)
        )
      );

    if (!existJob) {
      throw errors.NOT_FOUND();
    }

    const { page, limit, offset, where, orderBy } = buildPaginateOptions(
      {
        status: JobScheduleAssignementTable.status,
        createdAt: JobScheduleAssignementTable.createdAt,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: JobScheduleAssignementTable.id,
        role: JobScheduleAssignementTable.role,
        status: JobScheduleAssignementTable.status,
        acknowledgeAt: JobScheduleAssignementTable.acknowledgeAt,
        createdAt: JobScheduleAssignementTable.createdAt,
        updatedAt: JobScheduleAssignementTable.updatedAt,
        schedule: {
          id: JobScheduleTable.id,
          title: JobScheduleTable.title,
          startAt: JobScheduleTable.startAt,
          endAt: JobScheduleTable.endAt,
          createdAt: JobScheduleTable.createdAt,
          updatedAt: JobScheduleTable.updatedAt,
        },
        assignedToMember: userProfileColumns,
      })
      .from(JobScheduleAssignementTable)
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, JobScheduleAssignementTable.assignedTo)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .innerJoin(
        JobScheduleTable,
        eq(JobScheduleTable.id, JobScheduleAssignementTable.jobScheduleId)
      )
      .where(and(eq(JobScheduleTable.jobId, existJob.id), where))
      .groupBy(
        JobScheduleAssignementTable.id,
        OrganizationMemberTable.id,
        UserTable.id,
        JobScheduleTable.id
      )
      .$dynamic();

    const [totalCount, assignments] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: JobScheduleAssignementTable.id })
          .from(JobScheduleAssignementTable)
          .innerJoin(
            JobScheduleTable,
            eq(JobScheduleTable.id, JobScheduleAssignementTable.jobScheduleId)
          )
          .where(eq(JobScheduleTable.jobId, existJob.id))
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(
      totalCount,
      assignments.length,
      page,
      limit
    );

    return apiResponse(API_MESSAGES.JOB.GET_ALL_ASSIGNMENT, {
      meta,
      data: assignments,
    });
  });
