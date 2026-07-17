import z from "zod";

import { selectJobSchema } from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { jobBaseContract } from "./job.contract-base";

const tags = ["Organization", "Lead", "Job", "Delete"] as const;

const listJobBinContract = jobBaseContract
  .route({
    path: "/jobs/list/bin",
    description: "List recycle jobs",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectJobSchema>({
      searchFields: ["title"],
      orderFields: ["deletedAt"],
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectJobSchema
          .pick({
            id: true,
            title: true,
            status: true,
            deletedAt: true,
          })
          .extend({
            deletedByMember: userProfileSchema,
          })
      )
    )
  );
export type ListJobBinContractType = InferContractRouterType<
  typeof listJobBinContract
>;

const jobRestoreContract = jobBaseContract
  .route({
    path: "/jobs/restore",
    description: "Restore deleted job",
    tags,
  })
  .input(
    z.object({
      jobId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type JobRestoreContractType = InferContractRouterType<
  typeof jobRestoreContract
>;

const jobAllRestoreContract = jobBaseContract
  .route({
    path: "/jobs/restore/all",
    description: "Restore all deleted job",
    tags,
  })
  .input(
    z.object({
      jobIds: z.array(z.uuid()),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type JobAllRestoreContractType = InferContractRouterType<
  typeof jobAllRestoreContract
>;

const jobBinDeleteContract = jobBaseContract
  .route({
    path: "/jobs/delete/bin",
    description: "Delete bin job",
    tags,
  })
  .input(
    z.object({
      jobId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type JobBinDeleteContractType = InferContractRouterType<
  typeof jobBinDeleteContract
>;

const jobAllBinDeleteContract = jobBaseContract
  .route({
    path: "/jobs/delete/bin",
    description: "Delete bin job",
    tags,
  })
  .input(
    z.object({
      jobIds: z.array(z.uuid()),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type JobAllBinDeleteContractType = InferContractRouterType<
  typeof jobAllBinDeleteContract
>;

export const jobBinContract = {
  list: listJobBinContract,
  restore: jobRestoreContract,
  restoreAll: jobAllRestoreContract,
  delete: jobBinDeleteContract,
  deleteAll: jobAllBinDeleteContract,
};
