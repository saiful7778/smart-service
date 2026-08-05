import { and, eq, isNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  CustomerTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileColumns } from "@/features/user/user.api-schema";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";

import { leadImpl } from "./lead.procedure";

export const listCusotmerProcedure = leadImpl.customer.list
  .use(
    orgMemberPermissionsMiddleware(["org.customer.manage", "org.customer.list"])
  )
  .handler(async ({ input, context }) => {
    const { where, orderBy, limit, offset, page } = buildPaginateOptions(
      {
        name: CustomerTable.name,
        email: CustomerTable.email,
        phone: CustomerTable.phone,
        createdAt: CustomerTable.createdAt,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: CustomerTable.id,
        name: CustomerTable.name,
        email: CustomerTable.email,
        phone: CustomerTable.phone,
        company: CustomerTable.company,
        notes: CustomerTable.notes,
        source: CustomerTable.source,
        metadata: CustomerTable.metadata,
        createdAt: CustomerTable.createdAt,
        updatedAt: CustomerTable.updatedAt,
        createdBy: userProfileColumns,
      })
      .from(CustomerTable)
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, CustomerTable.createdBy)
      )
      .innerJoin(UserTable, eq(OrganizationMemberTable.userId, UserTable.id))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(OrgMemberRoleTable.roleId, RoleTable.id))
      .groupBy(CustomerTable.id, UserTable.id, OrganizationMemberTable.id)
      .where(and(eq(CustomerTable.orgId, context.org.id), where));

    const [totalCount, customers] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: CustomerTable.id })
          .from(CustomerTable)
          .where(eq(CustomerTable.orgId, context.org.id))
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, customers.length, page, limit);

    return apiResponse(API_MESSAGES.LEAD.CUSTOMER.GET_ALL, {
      meta,
      data: customers,
    });
  });

export const listCustomerForSearchProcedure = leadImpl.customer.listForSearch
  .use(
    orgMemberPermissionsMiddleware(["org.customer.manage", "org.customer.list"])
  )
  .handler(async ({ context, input }) => {
    const { where } = buildPaginateOptions(
      {
        name: CustomerTable.name,
        email: CustomerTable.email,
        phone: CustomerTable.phone,
      },
      input
    );

    const customers = await context.db
      .select({
        id: CustomerTable.id,
        name: CustomerTable.name,
        email: CustomerTable.email,
        phone: CustomerTable.phone,
        company: CustomerTable.company,
        createdAt: CustomerTable.createdAt,
        updatedAt: CustomerTable.updatedAt,
      })
      .from(CustomerTable)
      .where(
        and(
          eq(CustomerTable.orgId, context.org.id),
          isNull(CustomerTable.deletedAt),
          where
        )
      );

    return apiResponse(API_MESSAGES.LEAD.CUSTOMER.GET_ALL, customers);
  });
