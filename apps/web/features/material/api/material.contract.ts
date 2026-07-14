import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import { selectMaterialSchema } from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";

import { materialSchema } from "../material.schema";
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

const materialCreateContract = materialBaseContract
  .route({
    path: "/materials/create",
    description: "Create new material",
    tags,
  })
  .input(materialSchema)
  .output(apiOutputZodSchema(selectMaterialSchema));
export type MaterialCreateInput = InferContractRouterInputs<
  typeof materialCreateContract
>;
export type MaterialCreateOutput = InferContractRouterOutputs<
  typeof materialCreateContract
>;

const materialUpdateContract = materialBaseContract
  .route({
    path: "/materials/update",
    description: "Update new material",
    tags,
  })
  .input(materialSchema.extend({ materialId: z.uuid() }))
  .output(apiOutputZodSchema(selectMaterialSchema));
export type MaterialUpdateInput = InferContractRouterInputs<
  typeof materialUpdateContract
>;
export type MaterialUpdateOutput = InferContractRouterOutputs<
  typeof materialUpdateContract
>;

const materialDeleteContract = materialBaseContract
  .route({
    path: "/materials/delete",
    description: "Delete new material",
    tags,
  })
  .input(z.object({ materialId: z.uuid() }))
  .output(apiOutputZodSchema(z.null()));
export type MaterialDeleteInput = InferContractRouterInputs<
  typeof materialDeleteContract
>;
export type MaterialDeleteOutput = InferContractRouterOutputs<
  typeof materialDeleteContract
>;

export const materialContract = {
  list: listMaterialsContract,
  create: materialCreateContract,
  update: materialUpdateContract,
  delete: materialDeleteContract,
};
