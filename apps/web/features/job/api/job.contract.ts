import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import {
  selectAddressSchema,
  selectJobSchema,
} from "@workspace/drizzle/schemas";
import { JobStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";

import {
  jobCreateSchema,
  jobRevenueUpdateSchema,
  jobUpdateSchema,
} from "../job.schema";
import { jobBaseContract } from "./job.contract-base";

const tags = ["Organization", "Lead", "Job"] as const;

const listJobsContract = jobBaseContract
  .route({
    path: "/jobs/list",
    description: "list of jobs",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectJobSchema>({
      orderFields: [
        "serviceAt",
        "createdAt",
        "receivedRevenue",
        "expectedRevenue",
        "invoicedRevenue",
      ],
      searchFields: ["title"],
      filter: z.object({
        status: JobStatusEnumSchema.optional(),
        serviceAt: z
          .object({
            from: z.date().describe("service at from date").optional(),
            to: z.date().describe("service at to date").optional(),
          })
          .optional(),
        receivedRevenue: z
          .object({
            from: z.number().describe("Received revenue from").optional(),
            to: z.number().describe("Received revenue to").optional(),
          })
          .optional(),
        expectedRevenue: z
          .object({
            from: z.number().describe("Expected revenue from").optional(),
            to: z.number().describe("Expected revenue to").optional(),
          })
          .optional(),
        invoicedRevenue: z
          .object({
            from: z.number().describe("Invoiced revenue from").optional(),
            to: z.number().describe("Invoiced revenue to").optional(),
          })
          .optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectJobSchema.pick({
          id: true,
          title: true,
          leadId: true,
          description: true,
          status: true,
          serviceAt: true,
          createdAt: true,
          receivedRevenue: true,
          expectedRevenue: true,
          invoicedRevenue: true,
        })
      )
    )
  );
export type ListJobsInput = InferContractRouterInputs<typeof listJobsContract>;
export type ListJobsOutput = InferContractRouterOutputs<
  typeof listJobsContract
>["data"];

const jobCreateContract = jobBaseContract
  .route({
    path: "/jobs/create",
    description: "create a new job",
    tags,
  })
  .input(jobCreateSchema)
  .output(apiOutputZodSchema(selectJobSchema));
export type JobCreateInput = InferContractRouterInputs<
  typeof jobCreateContract
>;
export type JobCreateOutput = InferContractRouterOutputs<
  typeof jobCreateContract
>;

const jobUpdateContract = jobBaseContract
  .route({
    path: "/jobs/update",
    description: "update a job",
    tags,
  })
  .input(jobUpdateSchema)
  .output(apiOutputZodSchema(selectJobSchema));
export type JobUpdateInput = InferContractRouterInputs<
  typeof jobUpdateContract
>;
export type JobUpdateOutput = InferContractRouterOutputs<
  typeof jobUpdateContract
>["data"];

const jobUpdateRevenueContract = jobBaseContract
  .route({
    path: "/jobs/update/revenue",
    description: "update job revenue",
    tags,
  })
  .input(jobRevenueUpdateSchema)
  .output(apiOutputZodSchema(selectJobSchema));
export type JobUpdateRevenueInput = InferContractRouterInputs<
  typeof jobUpdateRevenueContract
>;
export type JobUpdateRevenueOutput = InferContractRouterOutputs<
  typeof jobUpdateRevenueContract
>["data"];

const jobDeleteContract = jobBaseContract
  .route({
    path: "/jobs/delete",
    description: "delete a job",
    tags,
  })
  .input(
    z.object({
      jobId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type JobDeleteInput = InferContractRouterInputs<
  typeof jobDeleteContract
>;
export type JobDeleteOutput = InferContractRouterOutputs<
  typeof jobDeleteContract
>["data"];

const listServicingsContract = jobBaseContract
  .route({
    path: "/jobs/servicings",
    description: "list of servicings",
    tags,
  })
  .output(apiOutputZodSchema(z.record(z.string(), z.number())));
export type ListServicingsInput = InferContractRouterInputs<
  typeof listServicingsContract
>;
export type ListServicingsOutput = InferContractRouterOutputs<
  typeof listServicingsContract
>["data"];

const jobDetailsContract = jobBaseContract
  .route({
    path: "/jobs/details",
    description: "get job details",
    tags,
  })
  .input(
    z.object({
      jobId: z.uuid(),
    })
  )
  .output(
    apiOutputZodSchema(
      selectJobSchema
        .pick({
          id: true,
          leadId: true,
          title: true,
          description: true,
          status: true,
          expectedRevenue: true,
          invoicedRevenue: true,
          receivedRevenue: true,
          serviceAt: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          createdByMember: userProfileSchema,
          addresses: z.array(
            selectAddressSchema
              .pick({
                id: true,
                line1: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
              })
              .extend({
                isPrimary: z.boolean(),
              })
          ),
        })
    )
  );
export type JobDetailsInput = InferContractRouterInputs<
  typeof jobDetailsContract
>;
export type JobDetailsOutput = InferContractRouterOutputs<
  typeof jobDetailsContract
>["data"];

export const jobContract = {
  list: listJobsContract,
  listServicings: listServicingsContract,
  create: jobCreateContract,
  update: jobUpdateContract,
  updateRevenue: jobUpdateRevenueContract,
  delete: jobDeleteContract,
  details: jobDetailsContract,
};
