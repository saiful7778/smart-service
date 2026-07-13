import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import { selectLeadCategorySchema } from "@workspace/drizzle/schemas";
import { apiOutputZodSchema } from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";

import { leadCategorySchema } from "../lead.schema";
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
  .input(leadCategorySchema)
  .output(apiOutputZodSchema(selectLeadCategorySchema));
export type LeadCategoryCreateInput = InferContractRouterInputs<
  typeof leadCategoryCreateContract
>;
export type LeadCategoryCreateOutput = InferContractRouterOutputs<
  typeof leadCategoryCreateContract
>["data"];

const leadCategoryUpdateContract = leadBaseContract
  .route({
    path: "/leads/categories/update",
    description: "Update a lead category",
    tags,
  })
  .input(leadCategorySchema.extend({ categoryId: z.uuid() }))
  .output(apiOutputZodSchema(selectLeadCategorySchema));
export type LeadCategoryUpdateInput = InferContractRouterInputs<
  typeof leadCategoryUpdateContract
>;
export type LeadCategoryUpdateOutput = InferContractRouterOutputs<
  typeof leadCategoryUpdateContract
>["data"];

const leadCategoryDeleteContract = leadBaseContract
  .route({
    path: "/leads/categories/delete",
    description: "Delete a lead category",
    tags,
  })
  .input(z.object({ categoryId: z.uuid() }))
  .output(apiOutputZodSchema(z.null()));
export type LeadCategoryDeleteInput = InferContractRouterInputs<
  typeof leadCategoryDeleteContract
>;
export type LeadCategoryDeleteOutput = InferContractRouterOutputs<
  typeof leadCategoryDeleteContract
>["data"];

export const leadCategoryContract = {
  list: listLeadCategoriesContract,
  listForSearch: listLeadCategoriesForSearchContract,
  create: leadCategoryCreateContract,
  update: leadCategoryUpdateContract,
  delete: leadCategoryDeleteContract,
};
