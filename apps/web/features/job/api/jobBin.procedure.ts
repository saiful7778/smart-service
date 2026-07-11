import { and, eq, inArray, isNotNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
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

export const listJobBinProcedure = jobImpl.bin.list
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.list"]))
  .handler(async ({ context, input }) => {
    const { page, limit, offset, where, orderBy } = buildPaginateOptions(
      {
        title: JobTable.title,
        deletedAt: JobTable.deletedAt,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: JobTable.id,
        title: JobTable.title,
        status: JobTable.status,
        deletedAt: JobTable.deletedAt,
        deletedByMember: userProfileColumns,
      })
      .from(JobTable)
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, JobTable.deletedBy)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .where(
        and(
          eq(JobTable.orgId, context.org.id),
          isNotNull(JobTable.deletedAt),
          where
        )
      )
      .groupBy(JobTable.id, OrganizationMemberTable.id, UserTable.id)
      .$dynamic();

    const [totalCount, jobs] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: JobTable.id })
          .from(JobTable)
          .where(
            and(
              eq(JobTable.orgId, context.org.id),
              isNotNull(JobTable.deletedAt)
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

export const jobRestoreProcedure = jobImpl.bin.restore
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.update"]))
  .handler(async ({ context, input, errors }) => {
    const [existJob] = await context.db
      .select({
        id: JobTable.id,
      })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.orgId, context.org.id),
          eq(JobTable.id, input.jobId),
          isNotNull(JobTable.deletedAt)
        )
      )
      .limit(1);

    if (!existJob) {
      throw errors.NOT_FOUND();
    }

    await context.db
      .update(JobTable)
      .set({
        deletedAt: null,
        deletedBy: null,
      })
      .where(eq(JobTable.id, existJob.id));

    return apiResponse(API_MESSAGES.JOB.RESTORE, null);
  });

export const jobAllRestoreProcedure = jobImpl.bin.restoreAll
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.update"]))
  .handler(async ({ context, input, errors }) => {
    const existJobs = await context.db
      .select({
        id: JobTable.id,
      })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.orgId, context.org.id),
          inArray(JobTable.id, input.jobIds),
          isNotNull(JobTable.deletedAt)
        )
      );

    if (existJobs.length === 0) {
      throw errors.BAD_REQUEST();
    }

    await context.db
      .update(JobTable)
      .set({
        deletedAt: null,
        deletedBy: null,
      })
      .where(
        inArray(
          JobTable.id,
          existJobs.map(({ id }) => id)
        )
      );

    return apiResponse(API_MESSAGES.JOB.RESTORE, null);
  });

export const jobBinDeleteProcedure = jobImpl.bin.delete
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.delete"]))
  .handler(async ({ context, input, errors }) => {
    const [existJob] = await context.db
      .select({
        id: JobTable.id,
      })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.orgId, context.org.id),
          eq(JobTable.id, input.jobId),
          isNotNull(JobTable.deletedAt)
        )
      )
      .limit(1);

    if (!existJob) {
      throw errors.NOT_FOUND();
    }

    await context.db.delete(JobTable).where(eq(JobTable.id, existJob.id));

    return apiResponse(API_MESSAGES.JOB.BIN_DELETE, null);
  });

export const jobBinDeleteAllProcedure = jobImpl.bin.deleteAll
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.delete"]))
  .handler(async ({ context, input, errors }) => {
    const existJobs = await context.db
      .select({
        id: JobTable.id,
      })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.orgId, context.org.id),
          inArray(JobTable.id, input.jobIds),
          isNotNull(JobTable.deletedAt)
        )
      );

    if (existJobs.length === 0) {
      throw errors.BAD_REQUEST();
    }

    await context.db.delete(JobTable).where(
      inArray(
        JobTable.id,
        existJobs.map(({ id }) => id)
      )
    );

    return apiResponse(API_MESSAGES.LEAD.BIN_DELETE_ALL, null);
  });
