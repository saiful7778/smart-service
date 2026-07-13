import { implement, ORPCError } from "@orpc/server";
import {
  and,
  countDistinct,
  desc,
  eq,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  AddressTable,
  CustomerTable,
  FileTable,
  InsertAddress,
  InsertLead,
  InsertLeadAddress,
  InsertLeadCategoryJoin,
  JobAddressTable,
  JobTable,
  LeadAddressTable,
  LeadAttachmentTable,
  LeadCategoryJoinTable,
  LeadCategoryTable,
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

import { leadContract } from "./lead.contract";

export const leadImpl = implement(leadContract)
  .$context<ORPCContext>()
  .use(loggerMiddleware)
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const leadCreateProcedure = leadImpl.create
  .use(orgMemberPermissionsMiddleware(["org.lead.manage", "org.lead.create"]))
  .handler(async ({ context, input }) => {
    const leadData = await context.db.transaction(async (tx) => {
      let customerId: string;

      if (input.isNewCustomer) {
        const customerName =
          input.customerName || input.customerPhone || "No Name";

        const [customerData] = await tx
          .insert(CustomerTable)
          .values({
            name: customerName,
            email: input.customerEmail,
            phone: input.customerPhone,
            orgId: context.org.id,
            createdBy: context.orgMember.id,
          })
          .returning({ id: CustomerTable.id });

        if (!customerData) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: API_MESSAGES.LEAD.CUSTOMER.NOT_CREATE,
          });
        }
        customerId = customerData.id;
      } else {
        const inputCustomerId = input.customerId;
        if (!inputCustomerId) {
          throw new ORPCError("BAD_REQUEST");
        }
        const [customerExists] = await tx
          .select({ id: CustomerTable.id })
          .from(CustomerTable)
          .where(
            and(
              eq(CustomerTable.id, inputCustomerId),
              eq(CustomerTable.orgId, context.org.id)
            )
          )
          .limit(1);

        if (!customerExists) {
          throw new ORPCError("NOT_FOUND", {
            message: API_MESSAGES.LEAD.CUSTOMER.NOT_FOUND,
          });
        }
        customerId = customerExists.id;
      }

      const [leadData] = await tx
        .insert(LeadTable)
        .values({
          orgId: context.org.id,
          source: input.source,
          description: input.description,
          status: input.status,
          serviceType: input.serviceType,
          customerId,
          createdBy: context.orgMember.id,
        } satisfies InsertLead)
        .returning();

      if (!leadData) {
        throw new ORPCError("BAD_REQUEST", {
          message: API_MESSAGES.LEAD.NOT_CREATE,
        });
      }

      if (input.categories && input.categories.length > 0) {
        const existingCategories = await tx
          .select({
            id: LeadCategoryTable.id,
            slug: LeadCategoryTable.slug,
          })
          .from(LeadCategoryTable)
          .where(
            and(
              eq(LeadCategoryTable.orgId, context.org.id),
              inArray(LeadCategoryTable.id, input.categories)
            )
          );

        await tx.insert(LeadCategoryJoinTable).values(
          existingCategories.map(
            ({ id }) =>
              ({
                leadId: leadData.id,
                leadCategoryId: id,
              }) satisfies InsertLeadCategoryJoin
          )
        );
      }

      if (input.addresses.length > 0) {
        const addresses = await tx
          .insert(AddressTable)
          .values(
            input.addresses.map(
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

        await tx.insert(LeadAddressTable).values(
          addresses.map(
            (address, index) =>
              ({
                leadId: leadData.id,
                addressId: address.id,
                isPrimary: input.addresses[index]?.isPrimary ?? false,
              }) satisfies InsertLeadAddress
          )
        );
      }

      return leadData;
    });

    return apiResponse(API_MESSAGES.LEAD.CREATE, leadData);
  });

export const listLeadProcedure = leadImpl.list
  .use(orgMemberPermissionsMiddleware(["org.lead.manage", "org.lead.list"]))
  .handler(async ({ context, input }) => {
    const { limit, offset, orderBy, page, where } = buildPaginateOptions(
      {
        name: CustomerTable.name,
        email: CustomerTable.email,
        phone: CustomerTable.phone,
        status: LeadTable.status,
        createdAt: LeadTable.createdAt,
        serviceType: LeadTable.serviceType,
        categories: LeadCategoryTable.slug,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: LeadTable.id,
        status: LeadTable.status,
        serviceType: LeadTable.serviceType,
        description: LeadTable.description,
        createdAt: LeadTable.createdAt,
        updatedAt: LeadTable.updatedAt,
        customer: {
          id: CustomerTable.id,
          name: CustomerTable.name,
          email: CustomerTable.email,
          phone: CustomerTable.phone,
        },
        totalJobs: countDistinct(JobTable.id).as("totalJobs"),
        leadCategories: jsonbAgg(
          {
            id: LeadCategoryTable.id,
            name: LeadCategoryTable.name,
            slug: LeadCategoryTable.slug,
            description: LeadCategoryTable.description,
          },
          LeadCategoryTable.id
        ).as("serviceCategories"),
      })
      .from(LeadTable)
      .leftJoin(
        LeadCategoryJoinTable,
        eq(LeadCategoryJoinTable.leadId, LeadTable.id)
      )
      .leftJoin(
        LeadCategoryTable,
        eq(LeadCategoryJoinTable.leadCategoryId, LeadCategoryTable.id)
      )
      .leftJoin(JobTable, eq(JobTable.leadId, LeadTable.id))
      .innerJoin(CustomerTable, eq(CustomerTable.id, LeadTable.customerId))
      .where(
        and(
          eq(LeadTable.orgId, context.org.id),
          isNull(LeadTable.deletedAt),
          isNull(JobTable.deletedAt),
          where
        )
      )
      .groupBy(LeadTable.id, CustomerTable.id)
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
              isNull(LeadTable.deletedAt)
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

export const leadUpdateProcedure = leadImpl.update
  .use(orgMemberPermissionsMiddleware(["org.lead.manage", "org.lead.update"]))
  .handler(async ({ context, input, errors }) => {
    const { leadId, categories, ...rest } = input;

    const [existLead] = await context.db
      .select({
        id: LeadTable.id,
      })
      .from(LeadTable)
      .where(
        and(
          eq(LeadTable.orgId, context.org.id),
          eq(LeadTable.id, leadId),
          isNull(LeadTable.deletedAt)
        )
      );

    if (!existLead) {
      throw errors.NOT_FOUND();
    }

    const leadData = await context.db.transaction(async (tx) => {
      const [leadData] = await tx
        .update(LeadTable)
        .set({
          ...rest,
          updatedAt: new Date(),
        })
        .where(eq(LeadTable.id, existLead.id))
        .returning();

      if (!leadData) {
        throw errors.NOT_FOUND();
      }

      if (categories) {
        // 1. Get valid selected categories
        const validSelectedCategories = await tx
          .select({ id: LeadCategoryTable.id })
          .from(LeadCategoryTable)
          .where(
            and(
              eq(LeadCategoryTable.orgId, context.org.id),
              inArray(LeadCategoryTable.id, categories)
            )
          );

        // 2. Get current categories for this lead
        const currentCategories = await tx
          .select({
            leadCategoryId: LeadCategoryJoinTable.leadCategoryId,
          })
          .from(LeadCategoryJoinTable)
          .where(eq(LeadCategoryJoinTable.leadId, leadData.id));

        const currentCategoryIds = new Set(
          currentCategories.map((c) => c.leadCategoryId)
        );
        const newCategoryIds = new Set(
          validSelectedCategories.map((c) => c.id)
        );

        // 3. Find categories to remove (in current but not in new)
        const toRemove = Array.from(currentCategoryIds).filter(
          (id) => !newCategoryIds.has(id)
        );

        // 4. Find categories to add (in new but not in current)
        const toAdd = validSelectedCategories.filter(
          (c) => !currentCategoryIds.has(c.id)
        );

        if (toRemove.length > 0) {
          await tx
            .delete(LeadCategoryJoinTable)
            .where(
              and(
                eq(LeadCategoryJoinTable.leadId, leadData.id),
                inArray(LeadCategoryJoinTable.leadCategoryId, toRemove)
              )
            );
        }

        if (toAdd.length > 0) {
          await tx.insert(LeadCategoryJoinTable).values(
            toAdd.map((c) => ({
              leadId: leadData.id,
              leadCategoryId: c.id,
            }))
          );
        }
      }

      return leadData;
    });

    return apiResponse(API_MESSAGES.LEAD.UPDATE, leadData);
  });

export const leadAddressUpdateProcedure = leadImpl.updateAddress
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead.manage", "org.lead.update"]
        : jobId
          ? ["org.job.manage", "org.job.update"]
          : [
              "org.lead.manage",
              "org.lead.update",
              "org.job.manage",
              "org.job.update",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    let leadId: string | undefined = undefined;
    let jobId: string | undefined = undefined;

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({
          id: LeadTable.id,
        })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.orgId, context.org.id),
            eq(LeadTable.id, input.leadId),
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
        .select({
          id: JobTable.id,
        })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.orgId, context.org.id),
            eq(JobTable.id, input.jobId),
            isNull(JobTable.deletedAt)
          )
        )
        .limit(1);

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      jobId = existJob.id;
    }

    await context.db.transaction(async (tx) => {
      if (input.addresses.length > 0) {
        // 1. Get existing addresses
        const existedAddresses: Array<{ id: string }> = [];

        if (leadId) {
          const existingAddresses = await tx
            .select({
              id: LeadAddressTable.addressId,
            })
            .from(LeadAddressTable)
            .where(eq(LeadAddressTable.leadId, leadId));

          existingAddresses.forEach((existingAddress) => {
            existedAddresses.push(existingAddress);
          });
        }
        if (jobId) {
          const existingAddresses = await tx
            .select({
              id: JobAddressTable.addressId,
            })
            .from(JobAddressTable)
            .where(eq(JobAddressTable.jobId, jobId));

          existingAddresses.forEach((existingAddress) => {
            existedAddresses.push(existingAddress);
          });
        }

        // 2. Identify addresses and separate them
        const incomingWithId = input.addresses.filter((a) => a.id);
        const incomingWithoutId = input.addresses.filter((a) => !a.id);
        const addressesToRemove = existedAddresses.filter(
          (l) => incomingWithId.findIndex((a) => a.id === l.id) === -1
        );

        try {
          // 3. Update existing addresses
          for (const addr of incomingWithId) {
            await tx
              .update(AddressTable)
              .set({
                line1: addr.line1,
                city: addr.city,
                state: addr.state,
                zipCode: addr.zipCode,
              })
              .where(eq(AddressTable.id, addr.id!))
              .returning();

            if (leadId) {
              await tx
                .update(LeadAddressTable)
                .set({ isPrimary: addr.isPrimary })
                .where(
                  and(
                    eq(LeadAddressTable.leadId, leadId),
                    eq(LeadAddressTable.addressId, addr.id!)
                  )
                );
            }
            if (jobId) {
              await tx
                .update(JobAddressTable)
                .set({ isPrimary: addr.isPrimary })
                .where(
                  and(
                    eq(JobAddressTable.jobId, jobId),
                    eq(JobAddressTable.addressId, addr.id!)
                  )
                );
            }
          }

          // 4. Create new addresses
          for (const addr of incomingWithoutId) {
            const [newAddr] = await tx
              .insert(AddressTable)
              .values({
                line1: addr.line1,
                city: addr.city,
                state: addr.state,
                zipCode: addr.zipCode,
              })
              .returning({ id: AddressTable.id });

            if (leadId) {
              if (newAddr) {
                await tx.insert(LeadAddressTable).values({
                  leadId,
                  addressId: newAddr.id,
                  isPrimary: addr.isPrimary,
                });
              }
            }
            if (jobId) {
              if (newAddr) {
                await tx.insert(JobAddressTable).values({
                  jobId,
                  addressId: newAddr.id,
                  isPrimary: addr.isPrimary,
                });
              }
            }
          }
        } catch (err) {
          context.logger.error({ err }, "Failed to update addresses");
          throw err;
        }

        // 5. Remove addresses
        if (addressesToRemove.length > 0) {
          if (leadId) {
            await tx.delete(LeadAddressTable).where(
              and(
                eq(LeadAddressTable.leadId, leadId),
                inArray(
                  LeadAddressTable.addressId,
                  addressesToRemove.map((l) => l.id)
                )
              )
            );
          }
          if (jobId) {
            await tx.delete(JobAddressTable).where(
              and(
                eq(JobAddressTable.jobId, jobId),
                inArray(
                  JobAddressTable.addressId,
                  addressesToRemove.map((l) => l.id)
                )
              )
            );
          }
        }
      }
    });

    return apiResponse(API_MESSAGES.LEAD.UPDATE_ADDRESS, null);
  });

export const leadDetailsProcedure = leadImpl.details
  .use(orgMemberPermissionsMiddleware(["org.lead.manage", "org.lead.read"]))
  .handler(async ({ context, input, errors }) => {
    const [existLead] = await context.db
      .select({ id: LeadTable.id })
      .from(LeadTable)
      .where(
        and(
          eq(LeadTable.orgId, context.org.id),
          isNull(LeadTable.deletedAt),
          eq(LeadTable.id, input.leadId)
        )
      )
      .limit(1);

    if (!existLead) {
      throw errors.NOT_FOUND();
    }

    const [leadData] = await context.db
      .select({
        id: LeadTable.id,
        status: LeadTable.status,
        source: LeadTable.source,
        serviceType: LeadTable.serviceType,
        description: LeadTable.description,
        createdAt: LeadTable.createdAt,
        updatedAt: LeadTable.updatedAt,
        customer: {
          id: CustomerTable.id,
          name: CustomerTable.name,
          email: CustomerTable.email,
          phone: CustomerTable.phone,
        },
        createdByMember: userProfileColumns,
        addresses: jsonbAgg(
          {
            id: AddressTable.id,
            line1: AddressTable.line1,
            city: AddressTable.city,
            state: AddressTable.state,
            zipCode: AddressTable.zipCode,
            country: AddressTable.country,
            isPrimary: LeadAddressTable.isPrimary,
          },
          AddressTable.id
        ).as("addresses"),
        leadCategories: jsonbAgg(
          {
            id: LeadCategoryTable.id,
            name: LeadCategoryTable.name,
            slug: LeadCategoryTable.slug,
            description: LeadCategoryTable.description,
          },
          LeadCategoryTable.id
        ).as("leadCategories"),
      })
      .from(LeadTable)
      .innerJoin(CustomerTable, eq(CustomerTable.id, LeadTable.customerId))
      .leftJoin(LeadAddressTable, eq(LeadAddressTable.leadId, LeadTable.id))
      .leftJoin(AddressTable, eq(AddressTable.id, LeadAddressTable.addressId))
      .leftJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, LeadTable.createdBy)
      )
      .leftJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .leftJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .leftJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .leftJoin(
        LeadCategoryJoinTable,
        eq(LeadCategoryJoinTable.leadId, LeadTable.id)
      )
      .leftJoin(
        LeadCategoryTable,
        eq(LeadCategoryJoinTable.leadCategoryId, LeadCategoryTable.id)
      )
      .where(eq(LeadTable.id, existLead.id))
      .groupBy(
        LeadTable.id,
        CustomerTable.id,
        OrganizationMemberTable.id,
        UserTable.id,
        RoleTable.id
      )
      .limit(1);

    if (!leadData) {
      throw errors.NOT_FOUND();
    }

    const [revenueStats] = await context.db
      .select({
        totalExpected: sql<number>`coalesce(sum(${JobTable.expectedRevenue}), 0)`,
        totalInvoiced: sql<number>`coalesce(sum(${JobTable.invoicedRevenue}), 0)`,
        totalReceived: sql<number>`coalesce(sum(${JobTable.receivedRevenue}), 0)`,
        totalMissed: sql<number>`coalesce(sum(${JobTable.invoicedRevenue}) - sum(${JobTable.receivedRevenue}), 0)`,
      })
      .from(JobTable)
      .where(and(eq(JobTable.leadId, leadData.id), isNull(JobTable.deletedAt)))
      .execute();

    const { createdByMember, addresses, ...restLeadData } = leadData;

    return apiResponse(API_MESSAGES.LEAD.GET_DETAILS, {
      ...restLeadData,
      addresses: addresses.map((address) => ({
        ...address,
        isPrimary: !!address.isPrimary,
      })),
      totalExpectedRevenue: revenueStats?.totalExpected?.toString() || "0.00",
      totalInvoicedRevenue: revenueStats?.totalInvoiced?.toString() || "0.00",
      totalReceivedRevenue: revenueStats?.totalReceived?.toString() || "0.00",
      totalMissedRevenue: revenueStats?.totalMissed?.toString() || "0.00",
      createdByMember: createdByMember?.userId
        ? {
            userId: createdByMember.userId!,
            orgMemberId: createdByMember.orgMemberId!,
            name: createdByMember.name!,
            email: createdByMember.email!,
            image: createdByMember.image!,
            roles: createdByMember.roles!,
          }
        : null,
    });
  });

export const leadDeleteProcedure = leadImpl.delete
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
          isNull(LeadTable.deletedAt)
        )
      )
      .limit(1);

    if (!existLead) {
      throw errors.NOT_FOUND();
    }

    await context.db.transaction(async (tx) => {
      const jobs = await tx
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.leadId, existLead.id),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      const jobIds = jobs.map(({ id }) => id);

      await tx
        .update(LeadTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        })
        .where(eq(LeadTable.id, existLead.id));

      await tx
        .update(JobTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        })
        .where(inArray(JobTable.id, jobIds));

      const jobAttachments = await tx
        .update(LeadAttachmentTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        })
        .where(inArray(LeadAttachmentTable.jobId, jobIds))
        .returning({ id: LeadAttachmentTable.id });

      await tx
        .update(FileTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.user.id,
        })
        .where(
          inArray(
            FileTable.id,
            jobAttachments.map(({ id }) => id)
          )
        );
    });

    return apiResponse(API_MESSAGES.LEAD.DELETE, null);
  });

export const leadAllDeleteProcedure = leadImpl.deleteAll
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
          isNull(LeadTable.deletedAt)
        )
      );

    if (existLeads.length === 0) {
      throw errors.BAD_REQUEST();
    }

    const leadIds = existLeads.map(({ id }) => id);

    await context.db.transaction(async (tx) => {
      const jobs = await tx
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            inArray(JobTable.leadId, leadIds),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      const jobIds = jobs.map(({ id }) => id);

      await tx
        .update(LeadTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        })
        .where(inArray(LeadTable.id, leadIds));

      await tx
        .update(JobTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        })
        .where(inArray(JobTable.id, jobIds));

      const jobAttachments = await tx
        .update(LeadAttachmentTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        })
        .where(inArray(LeadAttachmentTable.jobId, jobIds))
        .returning({ id: LeadAttachmentTable.id });

      await tx
        .update(FileTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.user.id,
        })
        .where(
          inArray(
            FileTable.id,
            jobAttachments.map(({ id }) => id)
          )
        );
    });

    return apiResponse(API_MESSAGES.LEAD.DELETE_ALL, null);
  });

export const leadRevenueHistoryProcedure = leadImpl.revenueHistory
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead.manage", "org.lead.read"]
        : jobId
          ? ["org.job.manage", "org.job.read"]
          : [
              "org.lead.manage",
              "org.job.read",
              "org.job.manage",
              "org.job.read",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    let leadId: string | undefined = undefined;
    let jobId: string | undefined = undefined;

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({
          id: LeadTable.id,
        })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.orgId, context.org.id),
            eq(LeadTable.id, input.leadId),
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
        .select({
          id: JobTable.id,
        })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.orgId, context.org.id),
            eq(JobTable.id, input.jobId),
            isNull(JobTable.deletedAt)
          )
        )
        .limit(1);

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      jobId = existJob.id;
    }

    if (!leadId && !jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSql = [];

    if (leadId) {
      whereSql.push(eq(LeadRevenueHistoryTable.leadId, leadId));
    }
    if (jobId) {
      whereSql.push(eq(LeadRevenueHistoryTable.jobId, jobId));
    }

    const revenueHistory = await context.db
      .select({
        id: LeadRevenueHistoryTable.id,
        leadId: LeadRevenueHistoryTable.leadId,
        revenueType: LeadRevenueHistoryTable.revenueType,
        oldValue: LeadRevenueHistoryTable.oldValue,
        newValue: LeadRevenueHistoryTable.newValue,
        changedByMember: userProfileColumns,
        changedAt: LeadRevenueHistoryTable.changedAt,
        changeReason: LeadRevenueHistoryTable.changeReason,
        job: {
          id: JobTable.id,
          title: JobTable.title,
        },
      })
      .from(LeadRevenueHistoryTable)
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, LeadRevenueHistoryTable.changedBy)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .leftJoin(JobTable, eq(JobTable.id, LeadRevenueHistoryTable.jobId))
      .orderBy(desc(LeadRevenueHistoryTable.changedAt))
      .where(and(...whereSql))
      .groupBy(
        LeadRevenueHistoryTable.id,
        OrganizationMemberTable.id,
        UserTable.id,
        JobTable.id
      );

    return apiResponse(API_MESSAGES.LEAD.GET_REVENUE_HISTORY, revenueHistory);
  });

export const listLeadForSearchProcedure = leadImpl.listForSearch
  .use(orgMemberPermissionsMiddleware(["org.lead.manage", "org.lead.list"]))
  .handler(async ({ context, input }) => {
    const { where } = buildPaginateOptions(
      {
        id: LeadTable.id,
        status: LeadTable.status,
        name: CustomerTable.name,
        email: CustomerTable.email,
        phone: CustomerTable.phone,
      },
      input
    );

    const leads = await context.db
      .select({
        id: LeadTable.id,
        status: LeadTable.status,
        customer: {
          id: CustomerTable.id,
          name: CustomerTable.name,
          email: CustomerTable.email,
          phone: CustomerTable.phone,
        },
      })
      .from(LeadTable)
      .innerJoin(CustomerTable, eq(CustomerTable.id, LeadTable.customerId))
      .where(
        and(
          eq(LeadTable.orgId, context.org.id),
          isNull(LeadTable.deletedAt),
          where
        )
      );

    return apiResponse(API_MESSAGES.LEAD.GET_ALL_FOR_SEARCH, leads);
  });
