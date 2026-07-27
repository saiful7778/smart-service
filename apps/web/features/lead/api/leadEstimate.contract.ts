import z from "zod";

import {
  selectCustomerSchema,
  selectLeadEstimateMaterialSchema,
  selectLeadEstimateSchema,
  selectMaterialSchema,
} from "@workspace/drizzle/schemas";
import { LeadEstimateStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { leadEstimateFormSchema } from "../lead.schema";
import { leadBaseContract } from "./lead.contract-base";
import { leadEstimateBinContract } from "./leadEstimateBin.contract";

const tags = ["Organization", "Lead", "Estimate"] as const;

const leadEstimateCreateContract = leadBaseContract
  .route({
    path: "/leads/estimate/create",
    method: "POST",
    description: "Create a lead/job estimate",
    tags,
  })
  .input(
    leadEstimateFormSchema.extend({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
    })
  )
  .output(
    apiOutputZodSchema(
      selectLeadEstimateSchema.pick({
        id: true,
        name: true,
        description: true,
        status: true,
        discountAmount: true,
        discountRate: true,
        taxRate: true,
        subtotal: true,
        taxAmount: true,
        totalAmount: true,
        validUntil: true,
        notes: true,
        terms: true,
      })
    )
  );
export type LeadEstimateCreateContractType = InferContractRouterType<
  typeof leadEstimateCreateContract
>;

const listLeadEstimateContract = leadBaseContract
  .route({
    method: "GET",
    path: "/leads/estimate/list",
    description: "Get lead/job estimates",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectLeadEstimateSchema>({
      orderFields: ["totalAmount", "createdAt"],
      searchFields: ["name"],
      filter: z.object({
        status: LeadEstimateStatusEnumSchema.optional(),
      }),
    }).extend({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectLeadEstimateSchema
          .pick({
            id: true,
            leadId: true,
            jobId: true,
            name: true,
            status: true,
            subtotal: true,
            discountRate: true,
            discountAmount: true,
            taxRate: true,
            taxAmount: true,
            totalAmount: true,
            validUntil: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            customer: selectCustomerSchema
              .pick({
                id: true,
                email: true,
                name: true,
                phone: true,
                company: true,
              })
              .nullable(),
          })
      )
    )
  );
export type ListLeadEstimateContractType = InferContractRouterType<
  typeof listLeadEstimateContract
>;

const leadEstimateDetailsContract = leadBaseContract
  .route({
    path: "/leads/estimate/details",
    description: "Details of lead/job estimate",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
      estimateId: z.uuid(),
    })
  )
  .output(
    apiOutputZodSchema(
      selectLeadEstimateSchema
        .pick({
          id: true,
          leadId: true,
          jobId: true,
          name: true,
          description: true,
          status: true,
          subtotal: true,
          discountRate: true,
          discountAmount: true,
          taxRate: true,
          taxAmount: true,
          totalAmount: true,
          validUntil: true,
          notes: true,
          terms: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          createdByMember: userProfileSchema,
          customer: selectCustomerSchema
            .pick({
              id: true,
              email: true,
              name: true,
              phone: true,
              company: true,
            })
            .nullable(),
          materials: z.array(
            selectLeadEstimateMaterialSchema
              .pick({
                id: true,
                quantity: true,
                totalPrice: true,
                notes: true,
              })
              .extend({
                material: selectMaterialSchema.pick({
                  id: true,
                  name: true,
                  sku: true,
                  unit: true,
                  unitPrice: true,
                  stockQuantity: true,
                }),
              })
          ),
        })
    )
  );
export type LeadEstimateDetailsContractType = InferContractRouterType<
  typeof leadEstimateDetailsContract
>;

const leadEstimateUpdateContract = leadBaseContract
  .route({
    path: "/leads/estimate/update",
    method: "POST",
    description: "Update a lead/job estimate",
    tags,
  })
  .input(
    leadEstimateFormSchema.omit({ status: true }).partial().extend({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
      estimateId: z.uuid(),
    })
  )
  .output(
    apiOutputZodSchema(
      selectLeadEstimateSchema.pick({
        id: true,
        name: true,
        description: true,
        status: true,
        subtotal: true,
        discountRate: true,
        discountAmount: true,
        taxRate: true,
        taxAmount: true,
        totalAmount: true,
        validUntil: true,
        notes: true,
        terms: true,
      })
    )
  );
export type LeadEstimateUpdateContractType = InferContractRouterType<
  typeof leadEstimateUpdateContract
>;

const leadEstimateDeleteContract = leadBaseContract
  .route({
    path: "/leads/estimate/delete",
    method: "POST",
    description: "Delete a lead/job estimate",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
      estimateId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadEstimateDeleteContractType = InferContractRouterType<
  typeof leadEstimateDeleteContract
>;

const leadEstimateSendContract = leadBaseContract
  .route({
    path: "/leads/estimate/send",
    method: "POST",
    description: "Send a lead/job estimate via email",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
      estimateId: z.uuid(),
      email: z.email().optional(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadEstimateSendContractType = InferContractRouterType<
  typeof leadEstimateSendContract
>;

const leadEstimateDeleteAllContract = leadBaseContract
  .route({
    path: "/leads/estimate/delete/all",
    method: "POST",
    description: "Delete all lead/job estimates",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
      estimateIds: z.array(z.uuid()),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadEstimateDeleteAllContractType = InferContractRouterType<
  typeof leadEstimateDeleteAllContract
>;

export const leadEstimateContract = {
  list: listLeadEstimateContract,
  details: leadEstimateDetailsContract,
  create: leadEstimateCreateContract,
  update: leadEstimateUpdateContract,
  send: leadEstimateSendContract,
  delete: leadEstimateDeleteContract,
  deleteAll: leadEstimateDeleteAllContract,
  bin: leadEstimateBinContract,
};
