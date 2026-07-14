import { implement } from "@orpc/server";
import { and, eq, isNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  MaterialTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
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
        createdByMember: userProfileColumns,
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
      .where(
        and(
          eq(MaterialTable.orgId, context.org.id),
          isNull(MaterialTable.deletedAt),
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
