import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";

import { selectMaterialSchema } from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";

import { materialBaseContract } from "./material.contract-base";

const tags = ["Organization", "Material"] as const;

const listMaterialsContract = materialBaseContract
  .route({
    path: "/materials/list",
    description: "list of materials",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectMaterialSchema>({
      orderFields: ["unitPrice", "costPrice", "stockQuantity", "createdAt"],
      searchFields: ["name", "sku"],
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectMaterialSchema
          .pick({
            id: true,
            name: true,
            sku: true,
            description: true,
            unitPrice: true,
            costPrice: true,
            stockQuantity: true,
            minimumStockLevel: true,
            unit: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            createdByMember: userProfileSchema,
          })
      )
    )
  );
export type ListMaterialInput = InferContractRouterInputs<
  typeof listMaterialsContract
>;
export type ListMaterialOutput = InferContractRouterOutputs<
  typeof listMaterialsContract
>["data"];

export const materialContract = {
  list: listMaterialsContract,
};
