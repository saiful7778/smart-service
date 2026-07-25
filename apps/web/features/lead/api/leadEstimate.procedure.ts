import { ORPCError } from "@orpc/client";
import { and, eq, inArray, isNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  InsertLeadEstimate,
  InsertLeadEstimateMaterial,
  JobTable,
  LeadEstimateMaterialTable,
  LeadEstimateTable,
  LeadTable,
  MaterialTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileColumns } from "@/features/user/user.api-schema";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";

import { increaseStock, reduceStock } from "./estimate-stock.helper";
import { leadImpl } from "./lead.procedure";

export const leadEstimateCreateProcedure = leadImpl.estimate.create
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_estimate.manage", "org.lead_estimate.create"]
        : jobId
          ? ["org.job_estimate.manage", "org.job_estimate.create"]
          : [
              "org.lead_estimate.manage",
              "org.lead_estimate.create",
              "org.job_estimate.manage",
              "org.job_estimate.create",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    let leadId: string | undefined;
    let jobId: string | undefined;

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
      leadId = existLead.id;
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
      jobId = existJob.id;
    }

    const materials = await context.db
      .select({
        id: MaterialTable.id,
        sku: MaterialTable.sku,
        unit: MaterialTable.unit,
        unitPrice: MaterialTable.unitPrice,
        stockQuantity: MaterialTable.stockQuantity,
      })
      .from(MaterialTable)
      .where(
        and(
          eq(MaterialTable.orgId, context.org.id),
          isNull(MaterialTable.deletedAt),
          inArray(
            MaterialTable.id,
            input.materials.map(({ materialId }) => materialId)
          )
        )
      );

    const estimateData = await context.db.transaction(async (tx) => {
      const materialsMap = new Map<
        string,
        {
          unitPrice: string;
          quantity: string;
          notes?: string | undefined;
        }
      >(
        input.materials.map(({ materialId, unitPrice, quantity, notes }) => [
          materialId,
          {
            unitPrice,
            quantity,
            notes,
          },
        ])
      );

      const subtotal = materials.reduce((sum, m) => {
        const mat = materialsMap.get(m.id);
        return (
          sum +
          (mat?.quantity ? Number(mat?.quantity) : 0) * Number(m.unitPrice || 0)
        );
      }, 0);

      const discount = Number(input.discount || 0);
      const taxRate = Number(input.taxRate || 0);
      const afterDiscount = Number(subtotal) - discount;
      const taxAmount = (afterDiscount * taxRate) / 100;
      const totalAmount = afterDiscount + Number(taxAmount);

      const [estimate] = await tx
        .insert(LeadEstimateTable)
        .values({
          leadId,
          jobId,
          name: input.name,
          description: input.description || null,
          status: input.status || "draft",
          discount: discount.toFixed(2),
          taxRate: taxRate.toFixed(2),
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          validUntil: input.validUntil ? new Date(input.validUntil) : null,
          notes: input.notes || null,
          terms: input.terms || null,
          createdBy: context.orgMember.id,
          orgId: context.org.id,
        } satisfies InsertLeadEstimate)
        .returning({
          id: LeadEstimateTable.id,
          name: LeadEstimateTable.name,
          description: LeadEstimateTable.description,
          status: LeadEstimateTable.status,
          discount: LeadEstimateTable.discount,
          taxRate: LeadEstimateTable.taxRate,
          subtotal: LeadEstimateTable.subtotal,
          taxAmount: LeadEstimateTable.taxAmount,
          totalAmount: LeadEstimateTable.totalAmount,
          validUntil: LeadEstimateTable.validUntil,
          notes: LeadEstimateTable.notes,
          terms: LeadEstimateTable.terms,
        });

      if (!estimate) {
        throw new ORPCError("BAD_REQUEST", {
          message: API_MESSAGES.ESTIMATE.NOT_CREATE,
        });
      }

      const insertMaterials = input.materials.map((m) => {
        const mat = materialsMap.get(m.materialId);
        const qty = Number(m.quantity);
        const unitPrice = mat ? Number(mat.unitPrice) : 0;
        return {
          estimateId: estimate.id,
          materialId: m.materialId,
          quantity: qty.toFixed(2),
          totalPrice: (qty * unitPrice).toFixed(2),
          notes: m.notes || null,
        } satisfies InsertLeadEstimateMaterial;
      });

      await tx.insert(LeadEstimateMaterialTable).values(insertMaterials);

      if (input.status === "approved") {
        await reduceStock(
          tx,
          input.materials.map((m) => ({
            materialId: m.materialId,
            quantity: m.quantity,
          }))
        );
      }

      return estimate;
    });

    return apiResponse(API_MESSAGES.ESTIMATE.CREATE, estimateData);
  });

export const listLeadEstimateProcedure = leadImpl.estimate.list
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
    const whereSQL = [
      eq(LeadEstimateTable.orgId, context.org.id),
      isNull(LeadEstimateTable.deletedAt),
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
        status: LeadEstimateTable.status,
        totalAmount: LeadEstimateTable.totalAmount,
        createdAt: LeadEstimateTable.createdAt,
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
        discount: LeadEstimateTable.discount,
        taxRate: LeadEstimateTable.taxRate,
        subtotal: LeadEstimateTable.subtotal,
        taxAmount: LeadEstimateTable.taxAmount,
        totalAmount: LeadEstimateTable.totalAmount,
        validUntil: LeadEstimateTable.validUntil,
        createdAt: LeadEstimateTable.createdAt,
        updatedAt: LeadEstimateTable.updatedAt,
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
              isNull(LeadEstimateTable.deletedAt)
            )
          )
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, estimates.length, page, limit);

    return apiResponse(API_MESSAGES.ESTIMATE.GET_ALL, {
      meta,
      data: estimates,
    });
  });

export const leadEstimateDetailsProcedure = leadImpl.estimate.details
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_estimate.manage", "org.lead_estimate.read"]
        : jobId
          ? ["org.job_estimate.manage", "org.job_estimate.read"]
          : [
              "org.lead_estimate.manage",
              "org.lead_estimate.read",
              "org.job_estimate.manage",
              "org.job_estimate.read",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSql = [
      eq(LeadEstimateTable.id, input.estimateId),
      eq(LeadEstimateTable.orgId, context.org.id),
      isNull(LeadEstimateTable.deletedAt),
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
      whereSql.push(eq(LeadEstimateTable.leadId, existLead.id));
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
      whereSql.push(eq(LeadEstimateTable.jobId, existJob.id));
    }

    const [estimateData] = await context.db
      .select({
        id: LeadEstimateTable.id,
        leadId: LeadEstimateTable.leadId,
        jobId: LeadEstimateTable.jobId,
        name: LeadEstimateTable.name,
        description: LeadEstimateTable.description,
        status: LeadEstimateTable.status,
        discount: LeadEstimateTable.discount,
        taxRate: LeadEstimateTable.taxRate,
        subtotal: LeadEstimateTable.subtotal,
        taxAmount: LeadEstimateTable.taxAmount,
        totalAmount: LeadEstimateTable.totalAmount,
        validUntil: LeadEstimateTable.validUntil,
        notes: LeadEstimateTable.notes,
        terms: LeadEstimateTable.terms,
        createdAt: LeadEstimateTable.createdAt,
        updatedAt: LeadEstimateTable.updatedAt,
        createdByMember: userProfileColumns,
      })
      .from(LeadEstimateTable)
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, LeadEstimateTable.createdBy)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .where(and(...whereSql))
      .groupBy(LeadEstimateTable.id, OrganizationMemberTable.id, UserTable.id)
      .limit(1);

    if (!estimateData) {
      throw errors.NOT_FOUND();
    }

    const materials = await context.db
      .select({
        id: LeadEstimateMaterialTable.id,
        quantity: LeadEstimateMaterialTable.quantity,
        totalPrice: LeadEstimateMaterialTable.totalPrice,
        notes: LeadEstimateMaterialTable.notes,
        material: {
          id: MaterialTable.id,
          name: MaterialTable.name,
          sku: MaterialTable.sku,
          unit: MaterialTable.unit,
          unitPrice: MaterialTable.unitPrice,
          stockQuantity: MaterialTable.stockQuantity,
        },
      })
      .from(LeadEstimateMaterialTable)
      .innerJoin(
        MaterialTable,
        eq(MaterialTable.id, LeadEstimateMaterialTable.materialId)
      )
      .where(eq(LeadEstimateMaterialTable.estimateId, estimateData.id));

    return apiResponse(API_MESSAGES.ESTIMATE.GET_DETAILS, {
      ...estimateData,
      materials,
    });
  });

export const leadEstimateUpdateProcedure = leadImpl.estimate.update
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

    const whereSql = [
      eq(LeadEstimateTable.id, input.estimateId),
      eq(LeadEstimateTable.orgId, context.org.id),
      isNull(LeadEstimateTable.deletedAt),
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
      whereSql.push(eq(LeadEstimateTable.leadId, existLead.id));
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
      whereSql.push(eq(LeadEstimateTable.jobId, existJob.id));
    }

    const [existingEstimate] = await context.db
      .select({
        id: LeadEstimateTable.id,
        status: LeadEstimateTable.status,
        discount: LeadEstimateTable.discount,
        taxRate: LeadEstimateTable.taxRate,
      })
      .from(LeadEstimateTable)
      .where(and(...whereSql))
      .limit(1);

    if (!existingEstimate) {
      throw errors.NOT_FOUND();
    }

    const estimateData = await context.db.transaction(async (tx) => {
      const oldStatus = existingEstimate.status;

      const updateData: Record<string, unknown> = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.terms !== undefined) updateData.terms = input.terms;
      if (input.discount !== undefined)
        updateData.discount = Number(input.discount).toFixed(2);
      if (input.taxRate !== undefined)
        updateData.taxRate = Number(input.taxRate).toFixed(2);
      if (input.status !== undefined) updateData.status = input.status;
      if (input.validUntil !== undefined)
        updateData.validUntil = new Date(input.validUntil);
      updateData.updatedBy = context.orgMember.id;

      let newSubtotal: string | undefined;
      if (input.materials) {
        const materialIds = input.materials.map((m) => m.materialId);
        const existingMaterials = await tx
          .select({
            id: MaterialTable.id,
            name: MaterialTable.name,
            sku: MaterialTable.sku,
            unit: MaterialTable.unit,
            unitPrice: MaterialTable.unitPrice,
          })
          .from(MaterialTable)
          .where(
            and(
              inArray(MaterialTable.id, materialIds),
              eq(MaterialTable.orgId, context.org.id),
              isNull(MaterialTable.deletedAt)
            )
          );

        const materialMap = new Map(existingMaterials.map((m) => [m.id, m]));

        const subtotal = input.materials.reduce((sum, m) => {
          const mat = materialMap.get(m.materialId);
          const unitPrice = mat ? Number(mat.unitPrice) : 0;
          return sum + Number(m.quantity) * unitPrice;
        }, 0);
        newSubtotal = subtotal.toFixed(2);

        if (updateData.discount === undefined) {
          const currentDiscount =
            input.discount !== undefined
              ? Number(input.discount)
              : Number(existingEstimate.discount || 0);
          updateData.discount = currentDiscount.toFixed(2);
        }
        if (updateData.taxRate === undefined) {
          const currentTaxRate =
            input.taxRate !== undefined
              ? Number(input.taxRate)
              : Number(existingEstimate.taxRate || 0);
          updateData.taxRate = currentTaxRate.toFixed(2);
        }

        const discount = Number(updateData.discount || 0);
        const taxRate = Number(updateData.taxRate || 0);
        const afterDiscount = subtotal - discount;
        const taxAmount = ((afterDiscount * taxRate) / 100).toFixed(2);
        const totalAmount = (afterDiscount + Number(taxAmount)).toFixed(2);

        updateData.subtotal = newSubtotal;
        updateData.taxAmount = taxAmount;
        updateData.totalAmount = totalAmount;

        await tx
          .delete(LeadEstimateMaterialTable)
          .where(eq(LeadEstimateMaterialTable.estimateId, existingEstimate.id));

        const insertMaterials = input.materials.map((m) => {
          const mat = materialMap.get(m.materialId);
          const qty = Number(m.quantity);
          const unitPrice = mat ? Number(mat.unitPrice) : 0;
          return {
            estimateId: existingEstimate.id,
            materialId: m.materialId,
            quantity: qty.toFixed(2),
            totalPrice: (qty * unitPrice).toFixed(2),
            notes: m.notes || null,
          } satisfies InsertLeadEstimateMaterial;
        });

        await tx.insert(LeadEstimateMaterialTable).values(insertMaterials);
      } else {
        const discount = Number(
          updateData.discount ?? existingEstimate.discount ?? 0
        );
        const taxRate = Number(
          updateData.taxRate ?? existingEstimate.taxRate ?? 0
        );

        if (
          updateData.discount !== undefined ||
          updateData.taxRate !== undefined
        ) {
          const currentMaterials = await tx
            .select({
              totalPrice: LeadEstimateMaterialTable.totalPrice,
            })
            .from(LeadEstimateMaterialTable)
            .where(
              eq(LeadEstimateMaterialTable.estimateId, existingEstimate.id)
            );

          const subtotal = currentMaterials.reduce(
            (sum, m) => sum + Number(m.totalPrice),
            0
          );
          newSubtotal = subtotal.toFixed(2);
          const afterDiscount = subtotal - discount;
          const taxAmount = ((afterDiscount * taxRate) / 100).toFixed(2);
          const totalAmount = (afterDiscount + Number(taxAmount)).toFixed(2);

          updateData.subtotal = newSubtotal;
          updateData.taxAmount = taxAmount;
          updateData.totalAmount = totalAmount;
        }
      }

      const newStatus = input.status ?? oldStatus;

      if (oldStatus === "approved" && newStatus !== "approved") {
        const oldMaterials = await tx
          .select({
            materialId: LeadEstimateMaterialTable.materialId,
            quantity: LeadEstimateMaterialTable.quantity,
          })
          .from(LeadEstimateMaterialTable)
          .where(eq(LeadEstimateMaterialTable.estimateId, existingEstimate.id));

        await increaseStock(
          tx,
          oldMaterials
            .filter((m) => m.materialId)
            .map((m) => ({
              materialId: m.materialId,
              quantity: m.quantity,
            }))
        );
      }

      if (newStatus === "approved" && oldStatus !== "approved") {
        const newMaterials = await tx
          .select({
            materialId: LeadEstimateMaterialTable.materialId,
            quantity: LeadEstimateMaterialTable.quantity,
          })
          .from(LeadEstimateMaterialTable)
          .where(eq(LeadEstimateMaterialTable.estimateId, existingEstimate.id));

        await reduceStock(
          tx,
          newMaterials
            .filter((m) => m.materialId)
            .map((m) => ({
              materialId: m.materialId,
              quantity: m.quantity,
            }))
        );
      }

      const [updated] = await tx
        .update(LeadEstimateTable)
        .set(updateData)
        .where(eq(LeadEstimateTable.id, existingEstimate.id))
        .returning({
          id: LeadEstimateTable.id,
          name: LeadEstimateTable.name,
          description: LeadEstimateTable.description,
          status: LeadEstimateTable.status,
          discount: LeadEstimateTable.discount,
          taxRate: LeadEstimateTable.taxRate,
          subtotal: LeadEstimateTable.subtotal,
          taxAmount: LeadEstimateTable.taxAmount,
          totalAmount: LeadEstimateTable.totalAmount,
          validUntil: LeadEstimateTable.validUntil,
          notes: LeadEstimateTable.notes,
          terms: LeadEstimateTable.terms,
        });

      if (!updated) {
        throw new ORPCError("BAD_REQUEST", {
          message: API_MESSAGES.ESTIMATE.NOT_UPDATE,
        });
      }

      return updated;
    });

    if (!estimateData) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.ESTIMATE.NOT_UPDATE,
      });
    }

    return apiResponse(API_MESSAGES.ESTIMATE.UPDATE, estimateData);
  });

export const leadEstimateDeleteProcedure = leadImpl.estimate.delete
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
      isNull(LeadEstimateTable.deletedAt),
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

    const [existingEstimate] = await context.db
      .select({
        id: LeadEstimateTable.id,
        status: LeadEstimateTable.status,
      })
      .from(LeadEstimateTable)
      .where(and(...whereSQL))
      .limit(1);

    if (!existingEstimate) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.ESTIMATE.NOT_FOUND,
      });
    }

    await context.db.transaction(async (tx) => {
      if (existingEstimate.status === "approved") {
        const estimateMaterials = await tx
          .select({
            materialId: LeadEstimateMaterialTable.materialId,
            quantity: LeadEstimateMaterialTable.quantity,
          })
          .from(LeadEstimateMaterialTable)
          .where(eq(LeadEstimateMaterialTable.estimateId, existingEstimate.id));

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
        .update(LeadEstimateTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        })
        .where(eq(LeadEstimateTable.id, existingEstimate.id));
    });

    return apiResponse(API_MESSAGES.ESTIMATE.DELETE, null);
  });

export const leadEstimateDeleteAllProcedure = leadImpl.estimate.deleteAll
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
      inArray(LeadEstimateTable.id, input.estimateIds),
      isNull(LeadEstimateTable.deletedAt),
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

    const existingEstimates = await context.db
      .select({
        id: LeadEstimateTable.id,
        status: LeadEstimateTable.status,
      })
      .from(LeadEstimateTable)
      .where(and(...whereSQL));

    if (existingEstimates.length === 0) {
      throw errors.NOT_FOUND();
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
            existingEstimates
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

      await tx
        .update(LeadEstimateTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        })
        .where(
          inArray(
            LeadEstimateTable.id,
            existingEstimates.map(({ id }) => id)
          )
        );
    });

    return apiResponse(API_MESSAGES.ESTIMATE.DELETE_ALL, null);
  });
