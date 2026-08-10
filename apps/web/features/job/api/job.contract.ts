import z from "zod";

import {
  selectAddressSchema,
  selectCustomerSchema,
  selectJobScheduleAssignementSchema,
  selectJobScheduleSchema,
  selectJobSchema,
  selectLeadSchema,
} from "@workspace/drizzle/schemas";
import { JobStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  exportDataInputZodSchema,
  exportDataOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import {
  jobCreateSchema,
  jobRevenueUpdateSchema,
  jobUpdateSchema,
} from "../job.schema";
import { jobBaseContract } from "./job.contract-base";
import { jobAssignmentContract } from "./jobAssignment.contract";
import { jobBinContract } from "./jobBin.contract";

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
        "createdAt",
        "receivedRevenue",
        "expectedRevenue",
        "invoicedRevenue",
      ],
      searchFields: ["title"],
      filter: z.object({
        status: JobStatusEnumSchema.optional(),
        createdAt: z
          .object({
            from: z.date().describe("Created at from date").optional(),
            to: z.date().describe("Created at to date").optional(),
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
        selectJobSchema
          .pick({
            id: true,
            title: true,
            leadId: true,
            description: true,
            status: true,
            createdAt: true,
            receivedRevenue: true,
            expectedRevenue: true,
            invoicedRevenue: true,
          })
          .extend({
            assignedCount: z.number(),
            schedule: z.array(
              selectJobScheduleSchema.pick({
                id: true,
                startAt: true,
                endAt: true,
              })
            ),
          })
      )
    )
  );
export type ListJobsContractType = InferContractRouterType<
  typeof listJobsContract
>;

const jobDataExportContract = jobBaseContract
  .route({
    path: "/jobs/export-data",
    description: "Export job data",
    tags,
  })
  .input(
    exportDataInputZodSchema<typeof selectJobSchema>({
      orderFields: [
        "createdAt",
        "receivedRevenue",
        "expectedRevenue",
        "invoicedRevenue",
      ],
      filter: z.object({
        status: JobStatusEnumSchema.optional(),
        createdAt: z
          .object({
            from: z.date().describe("Created at from date").optional(),
            to: z.date().describe("Created at to date").optional(),
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
      exportDataOutputZodSchema(
        selectJobSchema
          .pick({
            id: true,
            title: true,
            status: true,
            expectedRevenue: true,
            invoicedRevenue: true,
            receivedRevenue: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            customer: selectCustomerSchema
              .pick({
                id: true,
                name: true,
                email: true,
                phone: true,
              })
              .nullable(),
            lead: selectLeadSchema
              .pick({
                id: true,
                status: true,
                source: true,
                serviceType: true,
              })
              .nullable(),
          })
      )
    )
  );
export type JobDataExportContractType = InferContractRouterType<
  typeof jobDataExportContract
>;

const jobCreateContract = jobBaseContract
  .route({
    path: "/jobs/create",
    description: "create a new job",
    tags,
  })
  .input(jobCreateSchema)
  .output(apiOutputZodSchema(selectJobSchema));
export type JobCreateContractType = InferContractRouterType<
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
export type JobUpdateContractType = InferContractRouterType<
  typeof jobUpdateContract
>;

const jobUpdateRevenueContract = jobBaseContract
  .route({
    path: "/jobs/update/revenue",
    description: "update job revenue",
    tags,
  })
  .input(jobRevenueUpdateSchema)
  .output(apiOutputZodSchema(selectJobSchema));
export type JobUpdateRevenueContractType = InferContractRouterType<
  typeof jobUpdateRevenueContract
>;

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
export type JobDeleteContractType = InferContractRouterType<
  typeof jobDeleteContract
>;

const jobAllDeleteContract = jobBaseContract
  .route({
    path: "/jobs/delete/all",
    description: "delete all job",
    tags,
  })
  .input(
    z.object({
      jobIds: z.array(z.uuid()),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type JobAllDeleteContractType = InferContractRouterType<
  typeof jobAllDeleteContract
>;

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
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          createdByMember: userProfileSchema,
          schedules: z.array(
            selectJobScheduleSchema.pick({
              id: true,
              title: true,
              startAt: true,
              endAt: true,
              createdAt: true,
              updatedAt: true,
            })
          ),
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
export type JobDetailsContractType = InferContractRouterType<
  typeof jobDetailsContract
>;

const listJobScheduleContract = jobBaseContract
  .route({
    method: "GET",
    path: "/jobs/schedule",
    description: "Get job schedules",
    tags,
  })
  .output(
    apiOutputZodSchema(
      z.array(
        selectJobScheduleSchema
          .pick({
            id: true,
            title: true,
            startAt: true,
            endAt: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            job: selectJobSchema.pick({
              id: true,
              title: true,
              status: true,
              invoicedRevenue: true,
              expectedRevenue: true,
              receivedRevenue: true,
              createdAt: true,
            }),
            assignments: z.array(
              selectJobScheduleAssignementSchema
                .pick({
                  id: true,
                  status: true,
                  role: true,
                  acknowledgeAt: true,
                  createdAt: true,
                  updatedAt: true,
                })
                .extend({
                  assignedToMember: userProfileSchema,
                })
            ),
          })
      )
    )
  );
export type ListJobScheduleContractType = InferContractRouterType<
  typeof listJobScheduleContract
>;

export const jobContract = {
  list: listJobsContract,
  listSchedule: listJobScheduleContract,
  export: jobDataExportContract,
  create: jobCreateContract,
  update: jobUpdateContract,
  updateRevenue: jobUpdateRevenueContract,
  delete: jobDeleteContract,
  deleteAll: jobAllDeleteContract,
  details: jobDetailsContract,
  bin: jobBinContract,
  assignment: jobAssignmentContract,
};
