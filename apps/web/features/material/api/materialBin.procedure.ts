import { and, eq, inArray, isNotNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  FileTable,
  MaterialFileTable,
  MaterialTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { privateStorage, publicStorage } from "@/lib/storage";

import { API_MESSAGES } from "@/constants/apiMessage";
import { determineStorageType } from "@/features/upload/determineStorageType";
import { userProfileColumns } from "@/features/user/user.api-schema";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";

import { materialImpl } from "./material.procedure";

export const listMaterialBinProcedure = materialImpl.bin.list
  .use(
    orgMemberPermissionsMiddleware(["org.material.manage", "org.material.list"])
  )
  .handler(async ({ context, input }) => {
    const { page, limit, offset, where, orderBy } = buildPaginateOptions(
      {
        name: MaterialTable.name,
        sku: MaterialTable.sku,
        deletedAt: MaterialTable.deletedAt,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: MaterialTable.id,
        name: MaterialTable.name,
        sku: MaterialTable.sku,
        unit: MaterialTable.unit,
        deletedAt: MaterialTable.deletedAt,
        deletedByMember: userProfileColumns,
      })
      .from(MaterialTable)
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, MaterialTable.deletedBy)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .where(
        and(
          eq(MaterialTable.orgId, context.org.id),
          isNotNull(MaterialTable.deletedAt),
          where
        )
      )
      .groupBy(MaterialTable.id, OrganizationMemberTable.id, UserTable.id)
      .$dynamic();

    const [totalCount, materials] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: MaterialTable.id })
          .from(MaterialTable)
          .where(
            and(
              eq(MaterialTable.orgId, context.org.id),
              isNotNull(MaterialTable.deletedAt)
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

export const materialRestoreProcedure = materialImpl.bin.restore
  .use(
    orgMemberPermissionsMiddleware([
      "org.material.manage",
      "org.material.update",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [existMaterial] = await context.db
      .select({
        id: MaterialTable.id,
      })
      .from(MaterialTable)
      .where(
        and(
          eq(MaterialTable.orgId, context.org.id),
          eq(MaterialTable.id, input.materialId),
          isNotNull(MaterialTable.deletedAt)
        )
      )
      .limit(1);

    if (!existMaterial) {
      throw errors.NOT_FOUND();
    }

    await context.db.transaction(async (tx) => {
      await tx
        .update(MaterialTable)
        .set({
          deletedAt: null,
          deletedBy: null,
        })
        .where(eq(MaterialTable.id, existMaterial.id));
    });

    return apiResponse(API_MESSAGES.MATERIAL.BIN.RESTORE, null);
  });

export const materialAllRestoreProcedure = materialImpl.bin.restoreAll
  .use(
    orgMemberPermissionsMiddleware([
      "org.material.manage",
      "org.material.update",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const existMaterials = await context.db
      .select({
        id: MaterialTable.id,
      })
      .from(MaterialTable)
      .where(
        and(
          eq(MaterialTable.orgId, context.org.id),
          inArray(MaterialTable.id, input.materialIds),
          isNotNull(MaterialTable.deletedAt)
        )
      );

    if (existMaterials.length === 0) {
      throw errors.BAD_REQUEST();
    }

    const materialIds = existMaterials.map(({ id }) => id);

    await context.db.transaction(async (tx) => {
      await tx
        .update(MaterialTable)
        .set({
          deletedAt: null,
          deletedBy: null,
        })
        .where(inArray(MaterialTable.id, materialIds));
    });

    return apiResponse(API_MESSAGES.MATERIAL.BIN.RESTORE_ALL, null);
  });

export const materialBinDeleteProcedure = materialImpl.bin.delete
  .use(
    orgMemberPermissionsMiddleware([
      "org.material.manage",
      "org.material.delete",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [existMaterial] = await context.db
      .select({
        id: MaterialTable.id,
      })
      .from(MaterialTable)
      .where(
        and(
          eq(MaterialTable.orgId, context.org.id),
          eq(MaterialTable.id, input.materialId),
          isNotNull(MaterialTable.deletedAt)
        )
      )
      .limit(1);

    if (!existMaterial) {
      throw errors.NOT_FOUND();
    }

    const materialFiles = await context.db
      .select({
        id: MaterialFileTable.id,
        file: {
          id: FileTable.id,
          key: FileTable.key,
          entityType: FileTable.entityType,
        },
      })
      .from(MaterialFileTable)
      .innerJoin(FileTable, eq(FileTable.id, MaterialFileTable.fileId))
      .where(eq(MaterialFileTable.materialId, existMaterial.id));

    await context.db.transaction(async (tx) => {
      if (materialFiles.length > 0) {
        await tx.delete(MaterialFileTable).where(
          inArray(
            MaterialFileTable.id,
            materialFiles.map(({ id }) => id)
          )
        );

        await tx.delete(FileTable).where(
          inArray(
            FileTable.id,
            materialFiles.map(({ file }) => file.id)
          )
        );

        try {
          await Promise.all(
            materialFiles.map(async (materialFile) => {
              const entityType = materialFile.file.entityType;
              if (entityType) {
                const storageType = determineStorageType(entityType);
                const storage =
                  storageType === "private" ? privateStorage : publicStorage;

                await storage.delete(materialFile.file.key, "material_file");
              }
            })
          );
        } catch (err) {
          context.logger.error({ err }, "Error deleting file");
          tx.rollback();
        }
      }

      await tx
        .delete(MaterialTable)
        .where(eq(MaterialTable.id, existMaterial.id));
    });

    return apiResponse(API_MESSAGES.MATERIAL.BIN.DELETE, null);
  });

export const materialBinDeleteAllProcedure = materialImpl.bin.deleteAll
  .use(
    orgMemberPermissionsMiddleware([
      "org.material.manage",
      "org.material.delete",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const existMaterials = await context.db
      .select({
        id: MaterialTable.id,
      })
      .from(MaterialTable)
      .where(
        and(
          eq(MaterialTable.orgId, context.org.id),
          inArray(MaterialTable.id, input.materialIds),
          isNotNull(MaterialTable.deletedAt)
        )
      );

    if (existMaterials.length === 0) {
      throw errors.BAD_REQUEST();
    }

    const materialIds = existMaterials.map(({ id }) => id);

    const materialFiles = await context.db
      .select({
        id: MaterialFileTable.id,
        file: {
          id: FileTable.id,
          key: FileTable.key,
          entityType: FileTable.entityType,
        },
      })
      .from(MaterialFileTable)
      .innerJoin(FileTable, eq(FileTable.id, MaterialFileTable.fileId))
      .where(inArray(MaterialFileTable.materialId, materialIds));

    await context.db.transaction(async (tx) => {
      if (materialFiles.length > 0) {
        await tx.delete(MaterialFileTable).where(
          inArray(
            MaterialFileTable.id,
            materialFiles.map(({ id }) => id)
          )
        );

        await tx.delete(FileTable).where(
          inArray(
            FileTable.id,
            materialFiles.map(({ file }) => file.id)
          )
        );

        try {
          await Promise.all(
            materialFiles.map(async (materialFile) => {
              const entityType = materialFile.file.entityType;
              if (entityType) {
                const storageType = determineStorageType(entityType);
                const storage =
                  storageType === "private" ? privateStorage : publicStorage;

                await storage.delete(materialFile.file.key, "material_file");
              }
            })
          );
        } catch (err) {
          context.logger.error({ err }, "Error deleting file");
          tx.rollback();
        }
      }

      await tx
        .delete(MaterialTable)
        .where(inArray(MaterialTable.id, materialIds));
    });

    return apiResponse(API_MESSAGES.MATERIAL.BIN.DELETE_ALL, null);
  });
