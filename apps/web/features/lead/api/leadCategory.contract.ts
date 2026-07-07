import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import { selectLeadCategorySchema } from "@workspace/drizzle/schemas";
import { apiOutputZodSchema } from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";

import { leadCategoryCreateSchema } from "../lead.schema";
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

const listLeadCategoriesForSearchContract = leadBaseContract
  .route({
    path: "/leads/categories/list/search",
    description: "List of lead categories for search",
    tags,
  })
  .output(
    apiOutputZodSchema(
      z.array(
        selectLeadCategorySchema
          .pick({
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            totalLeads: z.number(),
          })
      )
    )
  );
export type ListLeadCategoriesForSearchInput = InferContractRouterInputs<
  typeof listLeadCategoriesForSearchContract
>;
export type ListLeadCategoriesForSearchOutput = InferContractRouterOutputs<
  typeof listLeadCategoriesForSearchContract
>["data"];

const leadCategoryCreateContract = leadBaseContract
  .route({
    path: "/leads/categories/create",
    description: "Create a new lead category",
    tags,
  })
  .input(leadCategoryCreateSchema)
  .output(apiOutputZodSchema(selectLeadCategorySchema));
export type LeadCategoryCreateInput = InferContractRouterInputs<
  typeof leadCategoryCreateContract
>;
export type LeadCategoryCreateOutput = InferContractRouterOutputs<
  typeof leadCategoryCreateContract
>["data"];

export const leadCategoryContract = {
  list: listLeadCategoriesContract,
  listForSearch: listLeadCategoriesForSearchContract,
  create: leadCategoryCreateContract,
};
