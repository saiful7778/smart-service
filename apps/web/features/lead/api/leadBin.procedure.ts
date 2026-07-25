import { and, eq, inArray, isNotNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  CustomerTable,
  LeadEstimateMaterialTable,
  LeadEstimateTable,
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
import {
  increaseStock,
  reduceStock,
} from "@/features/lead/api/estimate-stock.helper";

import { leadImpl } from "./lead.procedure";

export const listLeadBinProcedure = leadImpl.bin.list
  .use(orgMemberPermissionsMiddleware(["org.lead.manage", "org.lead.list"]))
  .handler(async ({ context, input }) => {
    const { limit, offset, orderBy, page, where } = buildPaginateOptions(
      {
        name: CustomerTable.name,
        email: CustomerTable.email,
        phone: CustomerTable.phone,
        deletedAt: LeadTable.deletedAt,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: LeadTable.id,
        status: LeadTable.status,
        serviceType: LeadTable.serviceType,
        deletedAt: LeadTable.deletedAt,
        customer: {
          id: CustomerTable.id,
          name: CustomerTable.name,
          email: CustomerTable.email,
          phone: CustomerTable.phone,
        },
        deletedByMember: userProfileColumns,
      })
      .from(LeadTable)
      .innerJoin(CustomerTable, eq(CustomerTable.id, LeadTable.customerId))
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, LeadTable.deletedBy)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .where(
        and(
          eq(LeadTable.orgId, context.org.id),
          isNotNull(LeadTable.deletedAt),
          where
        )
      )
      .groupBy(
        LeadTable.id,
        CustomerTable.id,
        OrganizationMemberTable.id,
        UserTable.id
      )
      .$dynamic();

    const [totalCount, leads] = await Promise.all([
      context.db.$count(
        context.db
          .select({
            id: LeadTable.id,
          })
          .from(LeadTable)
          .where(
            and(
              eq(LeadTable.orgId, context.org.id),
              isNotNull(LeadTable.deletedAt)
            )
          )
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, leads.length, page, limit);

    return apiResponse(API_MESSAGES.LEAD.GET_ALL, {
      meta,
      data: leads,
    });
  });

export const leadRestoreProcedure = leadImpl.bin.restore
  .use(orgMemberPermissionsMiddleware(["org.lead.manage", "org.lead.update"]))
  .handler(async ({ context, input, errors }) => {
    const [existLead] = await context.db
      .select({
        id: LeadTable.id,
      })
      .from(LeadTable)
      .where(
        and(
          eq(LeadTable.orgId, context.org.id),
          eq(LeadTable.id, input.leadId),
          isNotNull(LeadTable.deletedAt)
        )
      )
      .limit(1);

    if (!existLead) {
      throw errors.NOT_FOUND();
    }

    await context.db.transaction(async (tx) => {
      await tx
        .update(LeadTable)
        .set({
          deletedAt: null,
          deletedBy: null,
        })
        .where(eq(LeadTable.id, existLead.id));

      const estimatesToRestore = await tx
        .select({
          id: LeadEstimateTable.id,
          status: LeadEstimateTable.status,
        })
        .from(LeadEstimateTable)
        .where(
          and(
            eq(LeadEstimateTable.leadId, existLead.id),
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
      }
    });

    return apiResponse(API_MESSAGES.LEAD.BIN.RESTORE, null);
  });

export const leadAllRestoreProcedure = leadImpl.bin.restoreAll
  .use(orgMemberPermissionsMiddleware(["org.lead.manage", "org.lead.update"]))
  .handler(async ({ context, input, errors }) => {
    const existLeads = await context.db
      .select({
        id: LeadTable.id,
      })
      .from(LeadTable)
      .where(
        and(
          eq(LeadTable.orgId, context.org.id),
          inArray(LeadTable.id, input.leadIds),
          isNotNull(LeadTable.deletedAt)
        )
      );

    if (existLeads.length === 0) {
      throw errors.BAD_REQUEST();
    }

    const leadIds = existLeads.map(({ id }) => id);

    await context.db.transaction(async (tx) => {
      await tx
        .update(LeadTable)
        .set({
          deletedAt: null,
          deletedBy: null,
        })
        .where(inArray(LeadTable.id, leadIds));

      const estimatesToRestore = await tx
        .select({
          id: LeadEstimateTable.id,
          status: LeadEstimateTable.status,
        })
        .from(LeadEstimateTable)
        .where(
          and(
            inArray(LeadEstimateTable.leadId, leadIds),
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
      }
    });

    return apiResponse(API_MESSAGES.LEAD.BIN.RESTORE, null);
  });

export const leadBinDeleteProcedure = leadImpl.bin.delete
  .use(orgMemberPermissionsMiddleware(["org.lead.manage", "org.lead.delete"]))
  .handler(async ({ context, input, errors }) => {
    const [existLead] = await context.db
      .select({
        id: LeadTable.id,
      })
      .from(LeadTable)
      .where(
        and(
          eq(LeadTable.orgId, context.org.id),
          eq(LeadTable.id, input.leadId),
          isNotNull(LeadTable.deletedAt)
        )
      )
      .limit(1);

    if (!existLead) {
      throw errors.NOT_FOUND();
    }

    await context.db.transaction(async (tx) => {
      const estimatesToDelete = await tx
        .select({
          id: LeadEstimateTable.id,
          status: LeadEstimateTable.status,
        })
        .from(LeadEstimateTable)
        .where(eq(LeadEstimateTable.leadId, existLead.id));

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
          .delete(LeadEstimateMaterialTable)
          .where(
            inArray(
              LeadEstimateMaterialTable.estimateId,
              estimatesToDelete.map(({ id }) => id)
            )
          );

        await tx
          .delete(LeadEstimateTable)
          .where(
            inArray(
              LeadEstimateTable.id,
              estimatesToDelete.map(({ id }) => id)
            )
          );
      }

      await tx.delete(LeadTable).where(eq(LeadTable.id, existLead.id));
    });

    return apiResponse(API_MESSAGES.LEAD.BIN.DELETE, null);
  });

export const leadBinDeleteAllProcedure = leadImpl.bin.deleteAll
  .use(orgMemberPermissionsMiddleware(["org.lead.manage", "org.lead.delete"]))
  .handler(async ({ context, input, errors }) => {
    const existLeads = await context.db
      .select({
        id: LeadTable.id,
      })
      .from(LeadTable)
      .where(
        and(
          eq(LeadTable.orgId, context.org.id),
          inArray(LeadTable.id, input.leadIds),
          isNotNull(LeadTable.deletedAt)
        )
      );

    if (existLeads.length === 0) {
      throw errors.BAD_REQUEST();
    }

    const leadIds = existLeads.map(({ id }) => id);

    await context.db.transaction(async (tx) => {
      const estimatesToDelete = await tx
        .select({
          id: LeadEstimateTable.id,
          status: LeadEstimateTable.status,
        })
        .from(LeadEstimateTable)
        .where(inArray(LeadEstimateTable.leadId, leadIds));

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
          .delete(LeadEstimateMaterialTable)
          .where(
            inArray(
              LeadEstimateMaterialTable.estimateId,
              estimatesToDelete.map(({ id }) => id)
            )
          );

        await tx
          .delete(LeadEstimateTable)
          .where(
            inArray(
              LeadEstimateTable.id,
              estimatesToDelete.map(({ id }) => id)
            )
          );
      }

      await tx.delete(LeadTable).where(inArray(LeadTable.id, leadIds));
    });

    return apiResponse(API_MESSAGES.LEAD.BIN.DELETE_ALL, null);
  });
