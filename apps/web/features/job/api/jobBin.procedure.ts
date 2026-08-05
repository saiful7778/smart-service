import { and, eq, inArray, isNotNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  FileTable,
  JobTable,
  LeadAttachmentTable,
  LeadEstimateMaterialTable,
  LeadEstimateTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { privateStorage } from "@/lib/storage";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  increaseStock,
  reduceStock,
} from "@/features/lead/api/estimate-stock.helper";
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

    const jobAttachments = await context.db
      .select({
        id: LeadAttachmentTable.id,
        file: {
          id: FileTable.id,
          key: FileTable.key,
          entityType: FileTable.entityType,
        },
      })
      .from(LeadAttachmentTable)
      .innerJoin(FileTable, eq(FileTable.id, LeadAttachmentTable.fileId))
      .where(eq(LeadAttachmentTable.jobId, existJob.id));

    await context.db.transaction(async (tx) => {
      if (jobAttachments.length > 0) {
        await tx
          .update(FileTable)
          .set({
            deletedAt: null,
            deletedBy: null,
          })
          .where(
            inArray(
              FileTable.id,
              jobAttachments.map(({ file }) => file.id)
            )
          );

        await tx
          .update(LeadAttachmentTable)
          .set({
            deletedAt: null,
            deletedBy: null,
          })
          .where(
            inArray(
              LeadAttachmentTable.id,
              jobAttachments.map(({ id }) => id)
            )
          );
      }

      const estimatesToRestore = await tx
        .select({
          id: LeadEstimateTable.id,
          status: LeadEstimateTable.status,
        })
        .from(LeadEstimateTable)
        .where(
          and(
            eq(LeadEstimateTable.jobId, existJob.id),
            isNotNull(LeadEstimateTable.deletedAt)
          )
        );

      if (estimatesToRestore.length > 0) {
        await tx
          .update(LeadEstimateTable)
          .set({
            deletedAt: null,
            deletedBy: null,
          })
          .where(
            inArray(
              LeadEstimateTable.id,
              estimatesToRestore.map(({ id }) => id)
            )
          );

        const estimateMaterials = await tx
          .select({
            materialId: LeadEstimateMaterialTable.materialId,
            quantity: LeadEstimateMaterialTable.quantity,
          })
          .from(LeadEstimateMaterialTable)
          .where(
            inArray(
              LeadEstimateMaterialTable.estimateId,
              estimatesToRestore
                .filter(({ status }) => status === "accepted")
                .map(({ id }) => id)
            )
          );

        await reduceStock(
          tx,
          estimateMaterials.map((m) => ({
            materialId: m.materialId,
            quantity: m.quantity,
          }))
        );
      }

      await tx
        .update(JobTable)
        .set({
          deletedAt: null,
          deletedBy: null,
        })
        .where(eq(JobTable.id, existJob.id));
    });

    return apiResponse(API_MESSAGES.JOB.BIN.RESTORE, null);
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

    const jobIds = existJobs.map(({ id }) => id);

    const jobAttachments = await context.db
      .select({
        id: LeadAttachmentTable.id,
        file: {
          id: FileTable.id,
          key: FileTable.key,
          entityType: FileTable.entityType,
        },
      })
      .from(LeadAttachmentTable)
      .innerJoin(FileTable, eq(FileTable.id, LeadAttachmentTable.fileId))
      .where(inArray(LeadAttachmentTable.jobId, jobIds));

    await context.db.transaction(async (tx) => {
      if (jobAttachments.length > 0) {
        await tx
          .update(FileTable)
          .set({
            deletedAt: null,
            deletedBy: null,
          })
          .where(
            inArray(
              FileTable.id,
              jobAttachments.map(({ file }) => file.id)
            )
          );

        await tx
          .update(LeadAttachmentTable)
          .set({
            deletedAt: null,
            deletedBy: null,
          })
          .where(
            inArray(
              LeadAttachmentTable.id,
              jobAttachments.map(({ id }) => id)
            )
          );
      }

      const estimatesToRestore = await tx
        .select({
          id: LeadEstimateTable.id,
          status: LeadEstimateTable.status,
        })
        .from(LeadEstimateTable)
        .where(
          and(
            inArray(LeadEstimateTable.jobId, jobIds),
            isNotNull(LeadEstimateTable.deletedAt)
          )
        );

      if (estimatesToRestore.length > 0) {
        await tx
          .update(LeadEstimateTable)
          .set({
            deletedAt: null,
            deletedBy: null,
          })
          .where(
            inArray(
              LeadEstimateTable.id,
              estimatesToRestore.map(({ id }) => id)
            )
          );

        const estimateMaterials = await tx
          .select({
            materialId: LeadEstimateMaterialTable.materialId,
            quantity: LeadEstimateMaterialTable.quantity,
          })
          .from(LeadEstimateMaterialTable)
          .where(
            inArray(
              LeadEstimateMaterialTable.estimateId,
              estimatesToRestore
                .filter(({ status }) => status === "accepted")
                .map(({ id }) => id)
            )
          );

        await reduceStock(
          tx,
          estimateMaterials.map((m) => ({
            materialId: m.materialId,
            quantity: m.quantity,
          }))
        );
      }

      await tx
        .update(JobTable)
        .set({
          deletedAt: null,
          deletedBy: null,
        })
        .where(inArray(JobTable.id, jobIds));
    });

    return apiResponse(API_MESSAGES.JOB.BIN.RESTORE, null);
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

    const jobAttachments = await context.db
      .select({
        id: LeadAttachmentTable.id,
        file: {
          id: FileTable.id,
          key: FileTable.key,
          entityType: FileTable.entityType,
        },
      })
      .from(LeadAttachmentTable)
      .innerJoin(FileTable, eq(FileTable.id, LeadAttachmentTable.fileId))
      .where(eq(LeadAttachmentTable.jobId, existJob.id));

    await context.db.transaction(async (tx) => {
      if (jobAttachments.length > 0) {
        await tx.delete(LeadAttachmentTable).where(
          inArray(
            LeadAttachmentTable.id,
            jobAttachments.map(({ id }) => id)
          )
        );

        await tx.delete(FileTable).where(
          inArray(
            FileTable.id,
            jobAttachments.map(({ file }) => file.id)
          )
        );

        try {
          await Promise.all(
            jobAttachments.map(async (jobAttachment) => {
              await privateStorage.delete(
                jobAttachment.file.key,
                jobAttachment.file.entityType
              );
            })
          );
        } catch (err) {
          context.logger.error({ err }, "Error deleting file");
          tx.rollback();
        }
      }

      const estimatesToDelete = await tx
        .select({
          id: LeadEstimateTable.id,
          status: LeadEstimateTable.status,
        })
        .from(LeadEstimateTable)
        .where(eq(LeadEstimateTable.jobId, existJob.id));

      if (estimatesToDelete.length > 0) {
        const estimateMaterials = await tx
          .select({
            materialId: LeadEstimateMaterialTable.materialId,
            quantity: LeadEstimateMaterialTable.quantity,
          })
          .from(LeadEstimateMaterialTable)
          .where(
            inArray(
              LeadEstimateMaterialTable.estimateId,
              estimatesToDelete
                .filter(({ status }) => status === "accepted")
                .map(({ id }) => id)
            )
          );

        await increaseStock(
          tx,
          estimateMaterials.map((m) => ({
            materialId: m.materialId,
            quantity: m.quantity,
          }))
        );

        await tx.delete(LeadEstimateMaterialTable).where(
          inArray(
            LeadEstimateMaterialTable.estimateId,
            estimatesToDelete.map(({ id }) => id)
          )
        );

        await tx.delete(LeadEstimateTable).where(
          inArray(
            LeadEstimateTable.id,
            estimatesToDelete.map(({ id }) => id)
          )
        );
      }

      await tx.delete(JobTable).where(eq(JobTable.id, existJob.id));
    });

    return apiResponse(API_MESSAGES.JOB.BIN.DELETE, null);
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

    const jobIds = existJobs.map(({ id }) => id);

    const jobAttachments = await context.db
      .select({
        id: LeadAttachmentTable.id,
        file: {
          id: FileTable.id,
          key: FileTable.key,
          entityType: FileTable.entityType,
        },
      })
      .from(LeadAttachmentTable)
      .innerJoin(FileTable, eq(FileTable.id, LeadAttachmentTable.fileId))
      .where(inArray(LeadAttachmentTable.jobId, jobIds));

    await context.db.transaction(async (tx) => {
      if (jobAttachments.length > 0) {
        await tx.delete(LeadAttachmentTable).where(
          inArray(
            LeadAttachmentTable.id,
            jobAttachments.map(({ id }) => id)
          )
        );

        await tx.delete(FileTable).where(
          inArray(
            FileTable.id,
            jobAttachments.map(({ file }) => file.id)
          )
        );

        try {
          await Promise.all(
            jobAttachments.map(async (jobAttachment) => {
              await privateStorage.delete(
                jobAttachment.file.key,
                jobAttachment.file.entityType
              );
            })
          );
        } catch (err) {
          context.logger.error({ err }, "Error deleting file");
          tx.rollback();
        }
      }

      const estimatesToDelete = await tx
        .select({
          id: LeadEstimateTable.id,
          status: LeadEstimateTable.status,
        })
        .from(LeadEstimateTable)
        .where(inArray(LeadEstimateTable.jobId, jobIds));

      if (estimatesToDelete.length > 0) {
        const estimateMaterials = await tx
          .select({
            materialId: LeadEstimateMaterialTable.materialId,
            quantity: LeadEstimateMaterialTable.quantity,
          })
          .from(LeadEstimateMaterialTable)
          .where(
            inArray(
              LeadEstimateMaterialTable.estimateId,
              estimatesToDelete
                .filter(({ status }) => status === "accepted")
                .map(({ id }) => id)
            )
          );

        await increaseStock(
          tx,
          estimateMaterials.map((m) => ({
            materialId: m.materialId,
            quantity: m.quantity,
          }))
        );

        await tx.delete(LeadEstimateMaterialTable).where(
          inArray(
            LeadEstimateMaterialTable.estimateId,
            estimatesToDelete.map(({ id }) => id)
          )
        );

        await tx.delete(LeadEstimateTable).where(
          inArray(
            LeadEstimateTable.id,
            estimatesToDelete.map(({ id }) => id)
          )
        );
      }

      await tx.delete(JobTable).where(inArray(JobTable.id, jobIds));
    });

    return apiResponse(API_MESSAGES.JOB.BIN.DELETE_ALL, null);
  });
