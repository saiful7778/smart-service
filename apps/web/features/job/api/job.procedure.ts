import { implement, ORPCError } from "@orpc/server";
import { and, count, eq, isNotNull, isNull, sql } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  AddressTable,
  InsertAddress,
  InsertJobAddress,
  InsertLeadRevenueHistory,
  JobAddressTable,
  JobTable,
  LeadRevenueHistoryTable,
  LeadTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { jsonbAgg } from "@workspace/drizzle/sql-helpers";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileColumns } from "@/features/user/user.api-schema";
import { authMiddleware } from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { loggerMiddleware } from "@/server/middleware/logger.middleware";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { jobContract } from "./job.contract";

export const jobImpl = implement(jobContract)
  .$context<ORPCContext>()
  .use(loggerMiddleware)
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const listJobsProcedure = jobImpl.list
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.list"]))
  .handler(async ({ context, input }) => {
    const { page, limit, offset, where, orderBy } = buildPaginateOptions(
      {
        title: JobTable.title,
        status: JobTable.status,
        serviceAt: JobTable.serviceAt,
        createdAt: JobTable.createdAt,
        receivedRevenue: JobTable.receivedRevenue,
        expectedRevenue: JobTable.expectedRevenue,
        invoicedRevenue: JobTable.invoicedRevenue,
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
        serviceAt: JobTable.serviceAt,
        createdAt: JobTable.createdAt,
        receivedRevenue: JobTable.receivedRevenue,
        expectedRevenue: JobTable.expectedRevenue,
        invoicedRevenue: JobTable.invoicedRevenue,
      })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.orgId, context.org.id),
          isNull(JobTable.deletedAt),
          where
        )
      );

    const [totalCount, jobs] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: JobTable.id })
          .from(JobTable)
          .where(
            and(eq(JobTable.orgId, context.org.id), isNull(JobTable.deletedAt))
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

export const jobCreateProcedure = jobImpl.create
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.create"]))
  .handler(async ({ context, input }) => {
    const {
      leadId: inputLeadId,
      expectedRevenue,
      receivedRevenue,
      invoicedRevenue,
      addresses: inputAddresses,
      ...rest
    } = input;
    let leadId: string | undefined = undefined;

    if (inputLeadId) {
      const [existLead] = await context.db
        .select({ id: LeadTable.id })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.id, inputLeadId),
            eq(LeadTable.orgId, context.org.id),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.LEAD.NOT_FOUND,
        });
      }
      leadId = existLead.id;
    }

    const createdJob = await context.db.transaction(async (tx) => {
      const [createdJob] = await tx
        .insert(JobTable)
        .values({
          ...rest,
          leadId,
          expectedRevenue: expectedRevenue || "0.00",
          invoicedRevenue: invoicedRevenue || "0.00",
          receivedRevenue: receivedRevenue || "0.00",
          createdBy: context.orgMember.id,
          orgId: context.org.id,
        })
        .returning();

      if (!createdJob) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: API_MESSAGES.JOB.NOT_CREATED,
        });
      }

      if (inputAddresses.length > 0) {
        const addresses = await tx
          .insert(AddressTable)
          .values(
            inputAddresses.map(
              (address) =>
                ({
                  line1: address.line1,
                  city: address.city,
                  state: address.state,
                  zipCode: address.zipCode,
                }) satisfies InsertAddress
            )
          )
          .returning({
            id: AddressTable.id,
          });

        await tx.insert(JobAddressTable).values(
          addresses.map(
            (address, index) =>
              ({
                jobId: createdJob.id,
                addressId: address.id,
                isPrimary: inputAddresses[index]?.isPrimary ?? false,
              }) satisfies InsertJobAddress
          )
        );
      }

      return createdJob;
    });

    return apiResponse(API_MESSAGES.JOB.CREATED, createdJob);
  });

export const jobUpdateProcedure = jobImpl.update
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.update"]))
  .handler(async ({ context, input, errors }) => {
    const { jobId, ...rest } = input;

    const [existJob] = await context.db
      .select({
        id: JobTable.id,
        leadId: JobTable.leadId,
      })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.id, jobId),
          eq(JobTable.orgId, context.org.id),
          isNull(JobTable.deletedAt)
        )
      )
      .limit(1);

    if (!existJob) {
      throw errors.NOT_FOUND();
    }

    const [updatedJob] = await context.db
      .update(JobTable)
      .set({
        ...rest,
        updatedAt: new Date(),
      })
      .where(eq(JobTable.id, existJob.id))
      .returning();

    if (!updatedJob) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.JOB.NOT_UPDATED,
      });
    }

    return apiResponse(API_MESSAGES.JOB.UPDATED, updatedJob);
  });

export const jobUpdateRevenueProcedure = jobImpl.updateRevenue
  .use(
    orgMemberPermissionsMiddleware([
      "org.job_revenue.manage",
      "org.job_revenue.update",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [existJob] = await context.db
      .select({
        id: JobTable.id,
        leadId: JobTable.leadId,
        expectedRevenue: JobTable.expectedRevenue,
        invoicedRevenue: JobTable.invoicedRevenue,
        receivedRevenue: JobTable.receivedRevenue,
      })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.id, input.jobId),
          eq(JobTable.orgId, context.org.id),
          isNull(JobTable.deletedAt)
        )
      )
      .limit(1);

    if (!existJob) {
      throw errors.NOT_FOUND();
    }

    const updatedJob = await context.db.transaction(async (tx) => {
      const [updatedJob] = await tx
        .update(JobTable)
        .set({
          expectedRevenue: input?.expectedRevenue,
          invoicedRevenue: input?.invoicedRevenue,
          receivedRevenue: input?.receivedRevenue,
          updatedAt: new Date(),
        })
        .where(eq(JobTable.id, existJob.id))
        .returning();

      if (!updatedJob) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: API_MESSAGES.JOB.NOT_UPDATED,
        });
      }

      if (Number(input?.expectedRevenue)) {
        await tx.insert(LeadRevenueHistoryTable).values({
          leadId: updatedJob.leadId,
          jobId: updatedJob.id,
          changedBy: context.orgMember.id,
          revenueType: "expected",
          changeReason: input?.changeReason,
          oldValue: existJob.expectedRevenue,
          newValue: input.expectedRevenue,
        } satisfies InsertLeadRevenueHistory);
      }

      if (Number(input?.invoicedRevenue)) {
        await tx.insert(LeadRevenueHistoryTable).values({
          leadId: updatedJob.leadId,
          jobId: updatedJob.id,
          changedBy: context.orgMember.id,
          revenueType: "invoiced",
          changeReason: input?.changeReason,
          oldValue: existJob.invoicedRevenue,
          newValue: input.invoicedRevenue,
        } satisfies InsertLeadRevenueHistory);
      }

      if (Number(input?.receivedRevenue)) {
        await tx.insert(LeadRevenueHistoryTable).values({
          leadId: updatedJob.leadId,
          jobId: updatedJob.id,
          changedBy: context.orgMember.id,
          revenueType: "received",
          changeReason: input?.changeReason,
          oldValue: existJob.receivedRevenue,
          newValue: input.receivedRevenue,
        } satisfies InsertLeadRevenueHistory);
      }

      return updatedJob;
    });

    return apiResponse(API_MESSAGES.JOB.REVENUE_UPDATED, updatedJob);
  });

export const listServicingsProcedure = jobImpl.listServicings
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.read"]))
  .handler(async ({ context }) => {
    const servicings = await context.db
      .select({
        time: sql<string>`DATE(${JobTable.serviceAt})`.as("time"),
        count: count(JobTable.serviceAt).as("count"),
      })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.orgId, context.org.id),
          isNull(JobTable.deletedAt),
          isNotNull(JobTable.serviceAt)
        )
      )
      .groupBy(sql`DATE(${JobTable.serviceAt})`);

    const servicingMap = servicings.reduce<Record<string, number>>(
      (acc, servicing) => {
        acc[servicing.time] = servicing.count;
        return acc;
      },
      {}
    );

    return apiResponse(API_MESSAGES.JOB.GET_ALL_SERVICINGS, servicingMap);
  });

export const jobDeleteProcedure = jobImpl.delete
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.delete"]))
  .handler(async ({ context, input, errors }) => {
    const [existJob] = await context.db
      .select({
        id: JobTable.id,
        leadId: JobTable.leadId,
        title: JobTable.title,
      })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.id, input.jobId),
          eq(JobTable.orgId, context.org.id),
          isNull(JobTable.deletedAt)
        )
      )
      .limit(1);

    if (!existJob) {
      throw errors.NOT_FOUND();
    }

    await context.db.transaction(async (tx) => {
      await tx
        .update(JobTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        })
        .where(eq(JobTable.id, existJob.id));
    });

    return apiResponse(API_MESSAGES.JOB.DELETED, null);
  });

export const jobDetailsProcedure = jobImpl.details
  .use(orgMemberPermissionsMiddleware(["org.job.manage", "org.job.read"]))
  .handler(async ({ context, input, errors }) => {
    const [existJob] = await context.db
      .select({ id: JobTable.id })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.orgId, context.org.id),
          isNull(JobTable.deletedAt),
          eq(JobTable.id, input.jobId)
        )
      )
      .limit(1);

    if (!existJob) {
      throw errors.NOT_FOUND();
    }

    const [jobData] = await context.db
      .select({
        id: JobTable.id,
        leadId: JobTable.leadId,
        title: JobTable.title,
        description: JobTable.description,
        status: JobTable.status,
        expectedRevenue: JobTable.expectedRevenue,
        invoicedRevenue: JobTable.invoicedRevenue,
        receivedRevenue: JobTable.receivedRevenue,
        serviceAt: JobTable.serviceAt,
        createdAt: JobTable.createdAt,
        updatedAt: JobTable.updatedAt,
        createdByMember: userProfileColumns,
        addresses: jsonbAgg(
          {
            id: AddressTable.id,
            line1: AddressTable.line1,
            city: AddressTable.city,
            state: AddressTable.state,
            zipCode: AddressTable.zipCode,
            country: AddressTable.country,
            isPrimary: JobAddressTable.isPrimary,
          },
          AddressTable.id
        ).as("addresses"),
      })
      .from(JobTable)
      .leftJoin(JobAddressTable, eq(JobAddressTable.jobId, JobTable.id))
      .leftJoin(AddressTable, eq(AddressTable.id, JobAddressTable.addressId))
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, JobTable.createdBy)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .where(eq(JobTable.id, existJob.id))
      .groupBy(JobTable.id, OrganizationMemberTable.id, UserTable.id)
      .limit(1);

    if (!jobData) {
      throw errors.NOT_FOUND();
    }

    const { addresses, ...restJobData } = jobData;

    return apiResponse(API_MESSAGES.JOB.GET_DETAILS, {
      ...restJobData,
      addresses: addresses.map((address) => ({
        ...address,
        isPrimary: !!address.isPrimary,
      })),
    });
  });
