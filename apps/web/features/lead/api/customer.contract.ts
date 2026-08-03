import z from "zod";

import { selectCustomerSchema } from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { leadBaseContract } from "./lead.contract-base";

const listCustomerContract = leadBaseContract
  .route({
    path: "/customers/list",
    description: "List of customers",
  })
  .input(
    paginateInputZodSchema<typeof selectCustomerSchema>({
      searchFields: ["name", "email", "phone"],
      orderFields: ["createdAt", "name", "email"],
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectCustomerSchema
          .pick({
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            notes: true,
            source: true,
            metadata: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            createdBy: userProfileSchema,
          })
      )
    )
  );
export type ListCustomerContractType = InferContractRouterType<
  typeof listCustomerContract
>;

const listCustomerForSearchContract = leadBaseContract
  .route({
    path: "/customers/list/search",
    description: "Search for customers",
  })
  .input(
    paginateInputZodSchema<typeof selectCustomerSchema>({
      searchFields: ["name", "email", "phone"],
      orderFields: [],
    })
  )
  .output(
    apiOutputZodSchema(
      z.array(
        selectCustomerSchema.pick({
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          createdAt: true,
          updatedAt: true,
        })
      )
    )
  );
export type ListCustomerForSearchContractType = InferContractRouterType<
  typeof listCustomerForSearchContract
>;

export const customerContract = {
  list: listCustomerContract,
  listForSearch: listCustomerForSearchContract,
};
