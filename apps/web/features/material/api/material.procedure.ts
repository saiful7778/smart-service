import { implement, ORPCError } from "@orpc/server";
import { and, eq, isNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  FileTable,
  InsertMaterial,
  MaterialFileTable,
  MaterialTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UpdateMaterial,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { resolveFileUrl } from "@/features/upload/resolveFileUrl";
import { userProfileColumns } from "@/features/user/user.api-schema";
import { authMiddleware } from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { loggerMiddleware } from "@/server/middleware/logger.middleware";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { materialContract } from "./material.contract";

export const materialImpl = implement(materialContract)
  .$context<ORPCContext>()
  .use(loggerMiddleware)
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const listMaterialsProcedure = materialImpl.list
  .use(
    orgMemberPermissionsMiddleware(["org.material.manage", "org.material.list"])
  )
  .handler(async ({ context, input }) => {
    const { where, orderBy, offset, page, limit } = buildPaginateOptions(
      {
        name: MaterialTable.name,
        sku: MaterialTable.sku,
        unitPrice: MaterialTable.unitPrice,
        costPrice: MaterialTable.costPrice,
        stockQuantity: MaterialTable.stockQuantity,
        createdAt: MaterialTable.createdAt,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: MaterialTable.id,
        name: MaterialTable.name,
        sku: MaterialTable.sku,
        description: MaterialTable.description,
        unitPrice: MaterialTable.unitPrice,
        costPrice: MaterialTable.costPrice,
        stockQuantity: MaterialTable.stockQuantity,
        minimumStockLevel: MaterialTable.minimumStockLevel,
        unit: MaterialTable.unit,
        createdAt: MaterialTable.createdAt,
        updatedAt: MaterialTable.updatedAt,
      })
      .from(MaterialTable)
      .where(
        and(
          eq(MaterialTable.orgId, context.org.id),
          isNull(MaterialTable.deletedAt),
          where
        )
      )
      .$dynamic();

    const [totalCount, materials] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: MaterialTable.id })
          .from(MaterialTable)
          .where(
            and(
              eq(MaterialTable.orgId, context.org.id),
              isNull(MaterialTable.deletedAt)
            )
          )
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, materials.length, page, limit);

    return apiResponse(API_MESSAGES.MATERIAL.GET_ALL, {
      meta,
      data: materials,
    });
  });

export const materialDetailsProcedure = materialImpl.details
  .use(
    orgMemberPermissionsMiddleware(["org.material.manage", "org.material.read"])
  )
  .handler(async ({ context, input, errors }) => {
    const [existMaterial] = await context.db
      .select({
        id: MaterialTable.id,
      })
      .from(MaterialTable)
      .where(
        and(
          eq(MaterialTable.id, input.materialId),
          eq(MaterialTable.orgId, context.org.id),
          isNull(MaterialTable.deletedAt)
        )
      );

    if (!existMaterial) {
      throw errors.NOT_FOUND();
    }

    const [materialData] = await context.db
      .select({
        id: MaterialTable.id,
        name: MaterialTable.name,
        sku: MaterialTable.sku,
        description: MaterialTable.description,
        unitPrice: MaterialTable.unitPrice,
        costPrice: MaterialTable.costPrice,
        stockQuantity: MaterialTable.stockQuantity,
        minimumStockLevel: MaterialTable.minimumStockLevel,
        unit: MaterialTable.unit,
        createdAt: MaterialTable.createdAt,
        updatedAt: MaterialTable.updatedAt,
        createdByMember: userProfileColumns,
        image: {
          key: FileTable.key,
          entityType: FileTable.entityType,
        },
      })
      .from(MaterialTable)
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, MaterialTable.createdBy)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .leftJoin(
        MaterialFileTable,
        and(
          eq(MaterialFileTable.materialId, MaterialTable.id),
          eq(MaterialFileTable.isPrimary, true)
        )
      )
      .leftJoin(FileTable, eq(FileTable.id, MaterialFileTable.fileId))
      .where(eq(MaterialTable.id, existMaterial.id))
      .groupBy(
        MaterialTable.id,
        FileTable.id,
        OrganizationMemberTable.id,
        UserTable.id
      );

    if (!materialData) {
      throw errors.NOT_FOUND();
    }

    const imageUrl = await resolveFileUrl(materialData.image, {
      redisClient: context.redisClient,
    });

    return apiResponse(API_MESSAGES.MATERIAL.GET_DETAILS, {
      ...materialData,
      imageUrl,
    });
  });

export const materialCreateProcedure = materialImpl.create
  .use(
    orgMemberPermissionsMiddleware([
      "org.material.manage",
      "org.material.create",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [existMaterial] = await context.db
      .select({ id: MaterialTable.id })
      .from(MaterialTable)
      .where(
        and(
          eq(MaterialTable.sku, input.sku),
          eq(MaterialTable.orgId, context.org.id)
        )
      );

    if (existMaterial) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.MATERIAL.EXIST_SKU,
      });
    }

    if (input.fileId) {
      const [existFile] = await context.db
        .select({ id: FileTable.id })
        .from(FileTable)
        .where(
          and(
            eq(FileTable.id, input.fileId),
            eq(FileTable.uploadedBy, context.user.id),
            isNull(FileTable.deletedAt)
          )
        )
        .limit(1);

      if (!existFile) {
        throw errors.BAD_REQUEST({
          message: API_MESSAGES.UPLOAD.NOT_FOUND,
        });
      }
    }

    const materialData = await context.db.transaction(async (tx) => {
      const [materialData] = await tx
        .insert(MaterialTable)
        .values({
          name: input.name,
          sku: input.sku,
          description: input.description,
          unitPrice: input.unitPrice,
          costPrice: input.costPrice,
          stockQuantity: input.stockQuantity,
          minimumStockLevel: input.minimumStockLevel,
          unit: input.unit,
          orgId: context.org.id,
          createdBy: context.orgMember.id,
        } satisfies InsertMaterial)
        .returning();

      if (!materialData) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: API_MESSAGES.MATERIAL.NOT_CREATE,
        });
      }

      if (input.fileId) {
        await tx
          .update(FileTable)
          .set({
            entityId: materialData.id,
          })
          .where(eq(FileTable.id, input.fileId));

        await tx.insert(MaterialFileTable).values({
          fileId: input.fileId,
          materialId: materialData.id,
          isPrimary: true,
        });
      }

      return materialData;
    });

    return apiResponse(API_MESSAGES.MATERIAL.CREATE, materialData);
  });

export const materialUpdateProcedure = materialImpl.update
  .use(
    orgMemberPermissionsMiddleware([
      "org.material.manage",
      "org.material.update",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const { materialId, ...restInput } = input;
    const [existMaterial] = await context.db
      .select({ id: MaterialTable.id })
      .from(MaterialTable)
      .where(
        and(
          eq(MaterialTable.id, materialId),
          eq(MaterialTable.orgId, context.org.id),
          isNull(MaterialTable.deletedAt)
        )
      );

    if (!existMaterial) {
      throw errors.NOT_FOUND();
    }

    const [materialData] = await context.db
      .update(MaterialTable)
      .set({
        ...restInput,
      } satisfies UpdateMaterial)
      .where(eq(MaterialTable.id, existMaterial.id))
      .returning();

    if (!materialData) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.MATERIAL.NOT_UPDATE,
      });
    }

    return apiResponse(API_MESSAGES.MATERIAL.UPDATE, materialData);
  });

export const materialDeleteProcedure = materialImpl.delete
  .use(
    orgMemberPermissionsMiddleware([
      "org.material.manage",
      "org.material.delete",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [existMaterial] = await context.db
      .select({ id: MaterialTable.id })
      .from(MaterialTable)
      .where(
        and(
          eq(MaterialTable.id, input.materialId),
          eq(MaterialTable.orgId, context.org.id),
          isNull(MaterialTable.deletedAt)
        )
      );

    if (!existMaterial) {
      throw errors.NOT_FOUND();
    }

    await context.db.transaction(async (tx) => {
      await tx
        .update(MaterialTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        } satisfies UpdateMaterial)
        .where(eq(MaterialTable.id, existMaterial.id));
    });

    return apiResponse(API_MESSAGES.MATERIAL.UPDATE, null);
  });
