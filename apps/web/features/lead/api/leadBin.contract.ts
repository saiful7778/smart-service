import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import {
  selectCustomerSchema,
  selectLeadSchema,
} from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";

import { leadBaseContract } from "./lead.contract-base";

const tags = ["Organization", "Lead", "Bin"] as const;

const listLeadBinContract = leadBaseContract
  .route({
    path: "/leads/list/bin",
    description: "List recycle leads",
    tags,
  })
  .input(
    paginateInputZodSchema<
      typeof selectLeadSchema & typeof selectCustomerSchema
    >({
      searchFields: ["name", "email", "phone"],
      orderFields: ["deletedAt"],
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
            deletedAt: true,
          })
          .extend({
            customer: selectCustomerSchema.pick({
              id: true,
              name: true,
              email: true,
              phone: true,
            }),
            deletedByMember: userProfileSchema,
          })
      )
    )
  );
export type ListLeadBinInputs = InferContractRouterInputs<
  typeof listLeadBinContract
>;
export type ListLeadBinOutputs = InferContractRouterOutputs<
  typeof listLeadBinContract
>["data"];

const leadRestoreContract = leadBaseContract
  .route({
    path: "/leads/restore",
    description: "Restore deleted lead",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadRestoreInputs = InferContractRouterInputs<
  typeof leadRestoreContract
>;
export type LeadRestoreOutputs = InferContractRouterOutputs<
  typeof leadRestoreContract
>;

const leadAllRestoreContract = leadBaseContract
  .route({
    path: "/leads/restore/all",
    description: "Restore all deleted lead",
    tags,
  })
  .input(
    z.object({
      leadIds: z.array(z.uuid()),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadAllRestoreInputs = InferContractRouterInputs<
  typeof leadAllRestoreContract
>;
export type LeadAllRestoreOutputs = InferContractRouterOutputs<
  typeof leadAllRestoreContract
>;

const leadBinDeleteContract = leadBaseContract
  .route({
    path: "/leads/delete/bin",
    description: "Delete bin lead",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadBinDeleteInputs = InferContractRouterInputs<
  typeof leadBinDeleteContract
>;
export type LeadBinDeleteOutputs = InferContractRouterOutputs<
  typeof leadBinDeleteContract
>;

const leadAllBinDeleteContract = leadBaseContract
  .route({
    path: "/leads/delete/bin",
    description: "Delete bin lead",
    tags,
  })
  .input(
    z.object({
      leadIds: z.array(z.uuid()),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadAllBinDeleteInputs = InferContractRouterInputs<
  typeof leadAllBinDeleteContract
>;
export type LeadAllBinDeleteOutputs = InferContractRouterOutputs<
  typeof leadAllBinDeleteContract
>;

export const leadBinContract = {
  list: listLeadBinContract,
  restore: leadRestoreContract,
  restoreAll: leadAllRestoreContract,
  delete: leadBinDeleteContract,
  deleteAll: leadAllBinDeleteContract,
};
