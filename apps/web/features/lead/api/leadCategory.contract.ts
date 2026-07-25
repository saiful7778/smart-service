import z from "zod";

import { selectLeadCategorySchema } from "@workspace/drizzle/schemas";
import { apiOutputZodSchema } from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

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
export type ListLeadCategoriesContractType = InferContractRouterType<
  typeof listLeadCategoriesContract
>;

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
export type ListLeadCategoriesForSearchContractType = InferContractRouterType<
  typeof listLeadCategoriesForSearchContract
>;

const leadCategoryCreateContract = leadBaseContract
  .route({
    path: "/leads/categories/create",
    description: "Create a new lead category",
    tags,
  })
  .input(leadCategorySchema)
  .output(apiOutputZodSchema(selectLeadCategorySchema));
export type LeadCategoryCreateContractType = InferContractRouterType<
  typeof leadCategoryCreateContract
>;

const leadCategoryUpdateContract = leadBaseContract
  .route({
    path: "/leads/categories/update",
    description: "Update a lead category",
    tags,
  })
  .input(leadCategorySchema.extend({ categoryId: z.uuid() }))
  .output(apiOutputZodSchema(selectLeadCategorySchema));
export type LeadCategoryUpdateContractType = InferContractRouterType<
  typeof leadCategoryUpdateContract
>;

const leadCategoryDeleteContract = leadBaseContract
  .route({
    path: "/leads/categories/delete",
    description: "Delete a lead category",
    tags,
  })
  .input(z.object({ categoryId: z.uuid() }))
  .output(apiOutputZodSchema(z.null()));
export type LeadCategoryDeleteContractType = InferContractRouterType<
  typeof leadCategoryDeleteContract
>;

export const leadCategoryContract = {
  list: listLeadCategoriesContract,
  listForSearch: listLeadCategoriesForSearchContract,
  create: leadCategoryCreateContract,
  update: leadCategoryUpdateContract,
  delete: leadCategoryDeleteContract,
};
