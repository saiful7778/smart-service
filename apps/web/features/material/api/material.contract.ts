import z from "zod";

import { selectMaterialSchema } from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { materialSchema } from "../material.schema";
import { materialBaseContract } from "./material.contract-base";
import { materialBinContract } from "./materialBin.contract";

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
        selectMaterialSchema.pick({
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
      )
    )
  );
export type ListMaterialContractType = InferContractRouterType<
  typeof listMaterialsContract
>;

const listMaterialForSearchContract = materialBaseContract
  .route({
    path: "/materials/search",
    description: "Search materials",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectMaterialSchema>({
      orderFields: [],
      searchFields: ["name", "sku"],
    })
  )
  .output(
    apiOutputZodSchema(
      z.array(
        selectMaterialSchema.pick({
          id: true,
          name: true,
          sku: true,
          unitPrice: true,
          costPrice: true,
          stockQuantity: true,
          minimumStockLevel: true,
          unit: true,
        })
      )
    )
  );
export type ListMaterialForSearchContractType = InferContractRouterType<
  typeof listMaterialForSearchContract
>;

const materialDetailsContract = materialBaseContract
  .route({
    path: "/materials/details",
    description: "Material details",
    tags,
  })
  .input(z.object({ materialId: z.uuid() }))
  .output(
    apiOutputZodSchema(
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
          imageUrl: z.string().optional(),
          createdByMember: userProfileSchema,
        })
    )
  );
export type MaterialDetailsContractType = InferContractRouterType<
  typeof materialDetailsContract
>;

const materialCreateContract = materialBaseContract
  .route({
    path: "/materials/create",
    description: "Create new material",
    tags,
  })
  .input(materialSchema.extend({ fileId: z.uuid().optional() }))
  .output(apiOutputZodSchema(selectMaterialSchema));
export type MaterialCreateContractType = InferContractRouterType<
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
export type MaterialUpdateContractType = InferContractRouterType<
  typeof materialUpdateContract
>;

const materialDeleteContract = materialBaseContract
  .route({
    path: "/materials/delete",
    description: "Delete material",
    tags,
  })
  .input(z.object({ materialId: z.uuid() }))
  .output(apiOutputZodSchema(z.null()));
export type MaterialDeleteContractType = InferContractRouterType<
  typeof materialDeleteContract
>;

const materialAllDeleteContract = materialBaseContract
  .route({
    path: "/materials/delete/all",
    description: "Delete all material",
    tags,
  })
  .input(z.object({ materialIds: z.array(z.uuid()) }))
  .output(apiOutputZodSchema(z.null()));
export type MaterialAllDeleteContractType = InferContractRouterType<
  typeof materialAllDeleteContract
>;

export const materialContract = {
  list: listMaterialsContract,
  listForSearch: listMaterialForSearchContract,
  details: materialDetailsContract,
  create: materialCreateContract,
  update: materialUpdateContract,
  delete: materialDeleteContract,
  deleteAll: materialAllDeleteContract,
  bin: materialBinContract,
};
