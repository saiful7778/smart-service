import z from "zod";

import {
  selectAddressSchema,
  selectCustomerSchema,
  selectJobSchema,
  selectLeadCategorySchema,
  selectLeadRevenueHistorySchema,
  selectLeadSchema,
  updateLeadSchema,
} from "@workspace/drizzle/schemas";
import { LeadStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  exportDataInputZodSchema,
  exportDataOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { createLeadSchema, leadAddressSchema } from "../lead.schema";
import { customerContract } from "./customer.contract";
import { leadBaseContract } from "./lead.contract-base";
import { leadAttachmentContract } from "./leadAttachment.contract";
import { leadBinContract } from "./leadBin.contract";
import { leadCategoryContract } from "./leadCategory.contract";
import { leadEstimateContract } from "./leadEstimate.contract";
import { leadJobContract } from "./leadJob.contract";
import { leadNoteContract } from "./leadNote.contract";

const tags = ["Organization", "Lead"] as const;

const leadCreateContract = leadBaseContract
  .route({
    path: "/leads/create",
    description: "Create lead",
    tags,
  })
  .input(createLeadSchema)
  .output(apiOutputZodSchema(selectLeadSchema));
export type LeadCreateContractType = InferContractRouterType<
  typeof leadCreateContract
>;

const listLeadContract = leadBaseContract
  .route({
    path: "/leads/list",
    description: "List leads",
    tags,
  })
  .input(
    paginateInputZodSchema<
      typeof selectLeadSchema & typeof selectCustomerSchema
    >({
      searchFields: ["name", "email", "phone"],
      orderFields: ["createdAt"],
      filter: z.object({
        status: LeadStatusEnumSchema.optional(),
        categories: z
          .array(z.string().describe("Lead category slug"))
          .optional(),
        createdAt: z
          .object({
            from: z.date().describe("Created at from date").optional(),
            to: z.date().describe("Created at to date").optional(),
          })
          .optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectLeadSchema
          .pick({
            id: true,
            status: true,
            serviceType: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            customer: selectCustomerSchema.pick({
              id: true,
              name: true,
              email: true,
              phone: true,
            }),
            totalJobs: z.number(),
            leadCategories: z.array(
              selectLeadCategorySchema.pick({
                id: true,
                name: true,
                slug: true,
                description: true,
              })
            ),
          })
      )
    )
  );
export type ListLeadContractType = InferContractRouterType<
  typeof listLeadContract
>;

const leadDataExportContract = leadBaseContract
  .route({
    path: "/leads/export-data",
    description: "Export lead data",
    tags,
  })
  .input(
    exportDataInputZodSchema<
      typeof selectLeadSchema & typeof selectCustomerSchema
    >({
      orderFields: ["name", "createdAt"],
      filter: z.object({
        status: LeadStatusEnumSchema.optional(),
        categories: z
          .array(z.string().describe("Service category slug"))
          .optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      exportDataOutputZodSchema(
        selectLeadSchema
          .pick({
            id: true,
            status: true,
            createdAt: true,
          })
          .extend({
            customer: selectCustomerSchema.pick({
              id: true,
              name: true,
              email: true,
              phone: true,
              company: true,
            }),
          })
      )
    )
  );
export type LeadDataExportContractType = InferContractRouterType<
  typeof leadDataExportContract
>;

const listLeadForSearchContract = leadBaseContract
  .route({
    path: "/leads/search",
    description: "Search leads",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectCustomerSchema>({
      orderFields: [],
      searchFields: ["name", "email", "phone"],
    })
  )
  .output(
    apiOutputZodSchema(
      z.array(
        selectLeadSchema
          .pick({
            id: true,
            status: true,
          })
          .extend({
            customer: selectCustomerSchema.pick({
              id: true,
              name: true,
              email: true,
              phone: true,
            }),
          })
      )
    )
  );
export type ListLeadForSearchContractType = InferContractRouterType<
  typeof listLeadForSearchContract
>;

const leadUpdateContract = leadBaseContract
  .route({
    path: "/leads/update",
    description: "Update lead data",
    tags,
  })
  .input(
    updateLeadSchema
      .omit({
        orgId: true,
        customerId: true,
        createdBy: true,
        updatedBy: true,
        deletedAt: true,
        deletedBy: true,
      })
      .extend({
        leadId: z.uuid(),
        categories: z.array(z.string()).optional(),
      })
  )
  .output(apiOutputZodSchema(selectLeadSchema));
export type LeadUpdateContractType = InferContractRouterType<
  typeof leadUpdateContract
>;

const leadAddressUpdateContract = leadBaseContract
  .route({
    path: "/leads/update/address",
    description: "Update lead address data",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
      addresses: z.array(leadAddressSchema.extend({ id: z.uuid().optional() })),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadAddressUpdateContractType = InferContractRouterType<
  typeof leadAddressUpdateContract
>;

const leadDetailsContract = leadBaseContract
  .route({
    method: "GET",
    path: "/leads/details",
    description: "Get lead details",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid(),
    })
  )
  .output(
    apiOutputZodSchema(
      selectLeadSchema
        .pick({
          id: true,
          status: true,
          source: true,
          serviceType: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          customer: selectCustomerSchema.pick({
            id: true,
            name: true,
            email: true,
            phone: true,
          }),
          totalExpectedRevenue: z.string(),
          totalReceivedRevenue: z.string(),
          totalMissedRevenue: z.string(),
          totalInvoicedRevenue: z.string(),
          createdByMember: userProfileSchema.nullable(),
          addresses: z.array(
            selectAddressSchema
              .pick({
                id: true,
                line1: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
              })
              .extend({
                isPrimary: z.boolean(),
              })
          ),
          leadCategories: z.array(
            selectLeadCategorySchema.pick({
              id: true,
              name: true,
              slug: true,
              description: true,
            })
          ),
        })
    )
  );
export type LeadDetailsContractType = InferContractRouterType<
  typeof leadDetailsContract
>;

const leadDeleteContract = leadBaseContract
  .route({
    path: "/leads/delete",
    description: "Delete lead",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadDeleteContractType = InferContractRouterType<
  typeof leadDeleteContract
>;

const leadAllDeleteContract = leadBaseContract
  .route({
    path: "/leads/delete/all",
    description: "Delete all lead",
    tags,
  })
  .input(
    z.object({
      leadIds: z.array(z.uuid()),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadAllDeleteContractType = InferContractRouterType<
  typeof leadAllDeleteContract
>;

const revenueHistoryContract = leadBaseContract
  .route({
    method: "GET",
    path: "/leads/revenue-history",
    description: "Get lead revenue history",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
    })
  )
  .output(
    apiOutputZodSchema(
      z.array(
        selectLeadRevenueHistorySchema
          .pick({
            id: true,
            leadId: true,
            revenueType: true,
            oldValue: true,
            newValue: true,
            changedAt: true,
            changeReason: true,
          })
          .extend({
            changedByMember: userProfileSchema,
            job: selectJobSchema
              .pick({
                id: true,
                title: true,
              })
              .nullable(),
          })
      )
    )
  );
export type RevenueHistoryContractType = InferContractRouterType<
  typeof revenueHistoryContract
>;

export const leadContract = {
  list: listLeadContract,
  listForSearch: listLeadForSearchContract,
  export: leadDataExportContract,
  create: leadCreateContract,
  category: leadCategoryContract,
  customer: customerContract,
  update: leadUpdateContract,
  updateAddress: leadAddressUpdateContract,
  details: leadDetailsContract,
  delete: leadDeleteContract,
  deleteAll: leadAllDeleteContract,
  revenueHistory: revenueHistoryContract,
  note: leadNoteContract,
  job: leadJobContract,
  attachment: leadAttachmentContract,
  estimate: leadEstimateContract,
  bin: leadBinContract,
};
