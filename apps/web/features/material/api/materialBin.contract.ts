import z from "zod";

import { selectMaterialSchema } from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { materialBaseContract } from "./material.contract-base";

const tags = ["Organization", "Material", "Delete"] as const;

const listMaterialBinContract = materialBaseContract
  .route({
    path: "/materials/list/bin",
    description: "List recycle materials",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectMaterialSchema>({
      searchFields: ["name", "sku"],
      orderFields: ["deletedAt"],
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
            unit: true,
            deletedAt: true,
          })
          .extend({
            deletedByMember: userProfileSchema,
          })
      )
    )
  );
export type ListMaterialBinContractType = InferContractRouterType<
  typeof listMaterialBinContract
>;

const materialRestoreContract = materialBaseContract
  .route({
    path: "/materials/restore",
    description: "Restore deleted material",
    tags,
  })
  .input(
    z.object({
      materialId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type MaterialRestoreContractType = InferContractRouterType<
  typeof materialRestoreContract
>;

const materialAllRestoreContract = materialBaseContract
  .route({
    path: "/materials/restore/all",
    description: "Restore all deleted materials",
    tags,
  })
  .input(
    z.object({
      materialIds: z.array(z.uuid()),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type MaterialAllRestoreContractType = InferContractRouterType<
  typeof materialAllRestoreContract
>;

const materialBinDeleteContract = materialBaseContract
  .route({
    path: "/materials/delete/bin",
    description: "Delete bin material",
    tags,
  })
  .input(
    z.object({
      materialId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type MaterialBinDeleteContractType = InferContractRouterType<
  typeof materialBinDeleteContract
>;

const materialAllBinDeleteContract = materialBaseContract
  .route({
    path: "/materials/delete/bin",
    description: "Delete all bin materials",
    tags,
  })
  .input(
    z.object({
      materialIds: z.array(z.uuid()),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type MaterialAllBinDeleteContractType = InferContractRouterType<
  typeof materialAllBinDeleteContract
>;

export const materialBinContract = {
  list: listMaterialBinContract,
  restore: materialRestoreContract,
  restoreAll: materialAllRestoreContract,
  delete: materialBinDeleteContract,
  deleteAll: materialAllBinDeleteContract,
};
