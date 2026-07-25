import z from "zod";

import { selectLeadEstimateSchema } from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { InferContractRouterType } from "@/types/orpc.types";

import { leadBaseContract } from "./lead.contract-base";

const tags = ["Organization", "Lead", "Estimate", "Bin"] as const;

const listLeadEstimateBinContract = leadBaseContract
  .route({
    method: "GET",
    path: "/leads/estimate/list/bin",
    description: "Get deleted lead/job estimates",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectLeadEstimateSchema>({
      orderFields: ["totalAmount", "deletedAt"],
      searchFields: ["name"],
    }).extend({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectLeadEstimateSchema.pick({
          id: true,
          leadId: true,
          jobId: true,
          name: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          deletedAt: true,
        })
      )
    )
  );
export type ListLeadEstimateBinContractType = InferContractRouterType<
  typeof listLeadEstimateBinContract
>;

const leadEstimateRestoreContract = leadBaseContract
  .route({
    path: "/leads/estimate/restore",
    method: "POST",
    description: "Restore deleted lead/job estimate",
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
export type LeadEstimateRestoreContractType = InferContractRouterType<
  typeof leadEstimateRestoreContract
>;

const leadEstimateRestoreAllContract = leadBaseContract
  .route({
    path: "/leads/estimate/restore/all",
    method: "POST",
    description: "Restore deleted lead/job estimates",
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
export type LeadEstimateRestoreAllContractType = InferContractRouterType<
  typeof leadEstimateRestoreAllContract
>;

const leadEstimateBinDeleteContract = leadBaseContract
  .route({
    path: "/leads/estimate/delete/bin",
    method: "POST",
    description: "Permanently delete a lead/job estimate",
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
export type LeadEstimateBinDeleteContractType = InferContractRouterType<
  typeof leadEstimateBinDeleteContract
>;

const leadEstimateBinDeleteAllContract = leadBaseContract
  .route({
    path: "/leads/estimate/delete/bin/all",
    method: "POST",
    description: "Permanently delete all lead/job estimates",
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
export type LeadEstimateBinDeleteAllContractType = InferContractRouterType<
  typeof leadEstimateBinDeleteAllContract
>;

export const leadEstimateBinContract = {
  list: listLeadEstimateBinContract,
  restore: leadEstimateRestoreContract,
  restoreAll: leadEstimateRestoreAllContract,
  delete: leadEstimateBinDeleteContract,
  deleteAll: leadEstimateBinDeleteAllContract,
};
