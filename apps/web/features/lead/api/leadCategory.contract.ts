import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import { selectLeadCategorySchema } from "@workspace/drizzle/schemas";
import { apiOutputZodSchema } from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";

import { leadBaseContract } from "./lead.contract-base";

const tags = ["Organization", "Lead"] as const;

const listLeadCategoriesContract = leadBaseContract
  .route({
    path: "/leads/categories/list",
    description: "List of lead categories",
    tags,
  })
  .output(
    apiOutputZodSchema(
      z.array(
        selectLeadCategorySchema
          .pick({
            id: true,
            name: true,
            description: true,
            slug: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            totalLeads: z.number(),
            createdBy: userProfileSchema,
          })
      )
    )
  );
export type ListLeadCategoriesInput = InferContractRouterInputs<
  typeof listLeadCategoriesContract
>;
export type ListLeadCategoriesOutput = InferContractRouterOutputs<
  typeof listLeadCategoriesContract
>["data"];

export const leadCategoryContract = {
  list: listLeadCategoriesContract,
};
