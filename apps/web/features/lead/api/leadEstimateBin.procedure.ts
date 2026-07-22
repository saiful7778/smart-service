import { ORPCError } from "@orpc/client";
import { and, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";

import { DatabaseType } from "@workspace/drizzle/client";
import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  JobTable,
  LeadEstimateMaterialTable,
  LeadEstimateTable,
  LeadTable,
  MaterialTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";

import { leadImpl } from "./lead.procedure";

async function increaseStock(
  database: DatabaseType,
  materials: Array<{ materialId: string; quantity: string | number }>
) {
  for (const mat of materials) {
    if (!mat.materialId) continue;
    const qty = Number(mat.quantity);
    await database
      .update(MaterialTable)
      .set({
        stockQuantity: sql`${MaterialTable.stockQuantity} + ${qty}`,
      })
      .where(eq(MaterialTable.id, mat.materialId));
  }
}

async function reduceStock(
  database: DatabaseType,
  materials: Array<{ materialId: string; quantity: string | number }>
) {
  const materialIds = materials.map((m) => m.materialId);
  const existingMaterials = await database
    .select({
      id: MaterialTable.id,
      stockQuantity: MaterialTable.stockQuantity,
    })
    .from(MaterialTable)
    .where(
      and(
        inArray(MaterialTable.id, materialIds),
        isNull(MaterialTable.deletedAt)
      )
    );

  for (const mat of materials) {
    const existing = existingMaterials.find(
      (e: { id: string }) => e.id === mat.materialId
    );
    if (!existing) {
      throw new ORPCError("BAD_REQUEST", {
        message: `${API_MESSAGES.ESTIMATE.INSUFFICIENT_STOCK}Material not found`,
      });
    }
    const currentStock = Number(existing.stockQuantity);
    const qty = Number(mat.quantity);
    if (currentStock < qty) {
      throw new ORPCError("BAD_REQUEST", {
        message: `${API_MESSAGES.ESTIMATE.INSUFFICIENT_STOCK}insufficient stock`,
      });
    }
    await database
      .update(MaterialTable)
      .set({
        stockQuantity: sql`${MaterialTable.stockQuantity} - ${qty}`,
      })
      .where(eq(MaterialTable.id, mat.materialId));
  }
}

export const listLeadEstimateBinProcedure = leadImpl.estimate.bin.list
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_estimate.manage", "org.lead_estimate.list"]
        : jobId
          ? ["org.job_estimate.manage", "org.job_estimate.list"]
          : [
              "org.lead_estimate.manage",
              "org.lead_estimate.list",
              "org.job_estimate.manage",
              "org.job_estimate.list",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSQL = [
      eq(LeadEstimateTable.orgId, context.org.id),
      isNotNull(LeadEstimateTable.deletedAt),
    ];

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({ id: LeadTable.id })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.id, input.leadId),
            eq(LeadTable.orgId, context.org.id),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw errors.NOT_FOUND();
      }
      whereSQL.push(eq(LeadEstimateTable.leadId, existLead.id));
    }

    if (input?.jobId) {
      const [existJob] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, input.jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      whereSQL.push(eq(LeadEstimateTable.jobId, existJob.id));
    }

    const { limit, offset, orderBy, page, where } = buildPaginateOptions(
      {
        name: LeadEstimateTable.name,
        deletedAt: LeadEstimateTable.deletedAt,
      },
      input
    );

    if (where) {
      whereSQL.push(where);
    }

    const joinedQuery = context.db
      .select({
        id: LeadEstimateTable.id,
        leadId: LeadEstimateTable.leadId,
        jobId: LeadEstimateTable.jobId,
        name: LeadEstimateTable.name,
        status: LeadEstimateTable.status,
        totalAmount: LeadEstimateTable.totalAmount,
        createdAt: LeadEstimateTable.createdAt,
        deletedAt: LeadEstimateTable.deletedAt,
      })
      .from(LeadEstimateTable)
      .where(and(...whereSQL))
      .$dynamic();

    const [totalCount, estimates] = await Promise.all([
      context.db.$count(
        context.db
          .select({
            id: LeadEstimateTable.id,
          })
          .from(LeadEstimateTable)
          .where(
            and(
              eq(LeadEstimateTable.orgId, context.org.id),
              isNotNull(LeadEstimateTable.deletedAt)
            )
          )
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, estimates.length, page, limit);

    return apiResponse(API_MESSAGES.ESTIMATE.BIN.GET_ALL, {
      meta,
      data: estimates,
    });
  });

export const leadEstimateRestoreProcedure = leadImpl.estimate.bin.restore
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_estimate.manage", "org.lead_estimate.update"]
        : jobId
          ? ["org.job_estimate.manage", "org.job_estimate.update"]
          : [
              "org.lead_estimate.manage",
              "org.lead_estimate.update",
              "org.job_estimate.manage",
              "org.job_estimate.update",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSQL = [
      eq(LeadEstimateTable.id, input.estimateId),
      eq(LeadEstimateTable.orgId, context.org.id),
      isNotNull(LeadEstimateTable.deletedAt),
    ];

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({ id: LeadTable.id })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.id, input.leadId),
            eq(LeadTable.orgId, context.org.id),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw errors.NOT_FOUND();
      }
      whereSQL.push(eq(LeadEstimateTable.leadId, existLead.id));
    }

    if (input?.jobId) {
      const [existJob] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, input.jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      whereSQL.push(eq(LeadEstimateTable.jobId, existJob.id));
    }

    const [estimate] = await context.db
      .select({
        id: LeadEstimateTable.id,
        status: LeadEstimateTable.status,
      })
      .from(LeadEstimateTable)
      .where(and(...whereSQL))
      .limit(1);

    if (!estimate) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.ESTIMATE.NOT_FOUND,
      });
    }

    await context.db.transaction(async (tx) => {
      await tx
        .update(LeadEstimateTable)
        .set({
          deletedAt: null,
          deletedBy: null,
        })
        .where(eq(LeadEstimateTable.id, estimate.id));

      if (estimate.status === "approved") {
        const estimateMaterials = await tx
          .select({
            materialId: LeadEstimateMaterialTable.materialId,
            quantity: LeadEstimateMaterialTable.quantity,
          })
          .from(LeadEstimateMaterialTable)
          .where(eq(LeadEstimateMaterialTable.estimateId, estimate.id));

        await reduceStock(
          tx,
          estimateMaterials
            .filter((m) => m.materialId)
            .map((m) => ({
              materialId: m.materialId,
              quantity: m.quantity,
            }))
        );
      }
    });

    return apiResponse(API_MESSAGES.ESTIMATE.BIN.RESTORE, null);
  });

export const leadEstimateRestoreAllProcedure = leadImpl.estimate.bin.restoreAll
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_estimate.manage", "org.lead_estimate.update"]
        : jobId
          ? ["org.job_estimate.manage", "org.job_estimate.update"]
          : [
              "org.lead_estimate.manage",
              "org.lead_estimate.update",
              "org.job_estimate.manage",
              "org.job_estimate.update",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSQL = [
      eq(LeadEstimateTable.orgId, context.org.id),
      inArray(LeadEstimateTable.id, input.estimateIds),
      isNotNull(LeadEstimateTable.deletedAt),
    ];

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({ id: LeadTable.id })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.id, input.leadId),
            eq(LeadTable.orgId, context.org.id),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw errors.NOT_FOUND();
      }
      whereSQL.push(eq(LeadEstimateTable.leadId, existLead.id));
    }

    if (input?.jobId) {
      const [existJob] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, input.jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      whereSQL.push(eq(LeadEstimateTable.jobId, existJob.id));
    }

    const estimates = await context.db
      .select({
        id: LeadEstimateTable.id,
        status: LeadEstimateTable.status,
      })
      .from(LeadEstimateTable)
      .where(and(...whereSQL));

    if (estimates.length === 0) {
      throw errors.BAD_REQUEST();
    }

    await context.db.transaction(async (tx) => {
      await tx
        .update(LeadEstimateTable)
        .set({
          deletedAt: null,
          deletedBy: null,
        })
        .where(
          inArray(
            LeadEstimateTable.id,
            estimates.map(({ id }) => id)
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
            estimates
              .filter(({ status }) => status === "approved")
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
    });

    return apiResponse(API_MESSAGES.ESTIMATE.BIN.RESTORE_ALL, null);
  });

export const leadEstimateBinDeleteProcedure = leadImpl.estimate.bin.delete
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_estimate.manage", "org.lead_estimate.delete"]
        : jobId
          ? ["org.job_estimate.manage", "org.job_estimate.delete"]
          : [
              "org.lead_estimate.manage",
              "org.lead_estimate.delete",
              "org.job_estimate.manage",
              "org.job_estimate.delete",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSQL = [
      eq(LeadEstimateTable.id, input.estimateId),
      eq(LeadEstimateTable.orgId, context.org.id),
      isNotNull(LeadEstimateTable.deletedAt),
    ];

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({ id: LeadTable.id })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.id, input.leadId),
            eq(LeadTable.orgId, context.org.id),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw errors.NOT_FOUND();
      }
      whereSQL.push(eq(LeadEstimateTable.leadId, existLead.id));
    }

    if (input?.jobId) {
      const [existJob] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, input.jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      whereSQL.push(eq(LeadEstimateTable.jobId, existJob.id));
    }

    const [estimate] = await context.db
      .select({
        id: LeadEstimateTable.id,
        status: LeadEstimateTable.status,
      })
      .from(LeadEstimateTable)
      .where(and(...whereSQL))
      .limit(1);

    if (!estimate) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.ESTIMATE.NOT_FOUND,
      });
    }

    await context.db.transaction(async (tx) => {
      if (estimate.status === "approved") {
        const estimateMaterials = await tx
          .select({
            materialId: LeadEstimateMaterialTable.materialId,
            quantity: LeadEstimateMaterialTable.quantity,
          })
          .from(LeadEstimateMaterialTable)
          .where(eq(LeadEstimateMaterialTable.estimateId, estimate.id));

        await increaseStock(
          tx,
          estimateMaterials
            .filter((m) => m.materialId)
            .map((m) => ({
              materialId: m.materialId,
              quantity: m.quantity,
            }))
        );
      }

      await tx
        .delete(LeadEstimateMaterialTable)
        .where(eq(LeadEstimateMaterialTable.estimateId, estimate.id));

      await tx
        .delete(LeadEstimateTable)
        .where(eq(LeadEstimateTable.id, estimate.id));
    });

    return apiResponse(API_MESSAGES.ESTIMATE.BIN.DELETE, null);
  });

export const leadEstimateBinDeleteAllProcedure = leadImpl.estimate.bin.deleteAll
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_estimate.manage", "org.lead_estimate.delete"]
        : jobId
          ? ["org.job_estimate.manage", "org.job_estimate.delete"]
          : [
              "org.lead_estimate.manage",
              "org.lead_estimate.delete",
              "org.job_estimate.manage",
              "org.job_estimate.delete",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSQL = [
      eq(LeadEstimateTable.orgId, context.org.id),
      inArray(LeadEstimateTable.id, input.estimateIds),
      isNotNull(LeadEstimateTable.deletedAt),
    ];

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({ id: LeadTable.id })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.id, input.leadId),
            eq(LeadTable.orgId, context.org.id),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw errors.NOT_FOUND();
      }
      whereSQL.push(eq(LeadEstimateTable.leadId, existLead.id));
    }

    if (input?.jobId) {
      const [existJob] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, input.jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      whereSQL.push(eq(LeadEstimateTable.jobId, existJob.id));
    }

    const estimates = await context.db
      .select({
        id: LeadEstimateTable.id,
        status: LeadEstimateTable.status,
      })
      .from(LeadEstimateTable)
      .where(and(...whereSQL));

    if (estimates.length === 0) {
      throw errors.BAD_REQUEST();
    }

    await context.db.transaction(async (tx) => {
      const estimateMaterials = await tx
        .select({
          materialId: LeadEstimateMaterialTable.materialId,
          quantity: LeadEstimateMaterialTable.quantity,
        })
        .from(LeadEstimateMaterialTable)
        .where(
          inArray(
            LeadEstimateMaterialTable.estimateId,
            estimates
              .filter(({ status }) => status === "approved")
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
          estimates.map(({ id }) => id)
        )
      );

      await tx.delete(LeadEstimateTable).where(
        inArray(
          LeadEstimateTable.id,
          estimates.map(({ id }) => id)
        )
      );
    });

    return apiResponse(API_MESSAGES.ESTIMATE.BIN.DELETE_ALL, null);
  });
