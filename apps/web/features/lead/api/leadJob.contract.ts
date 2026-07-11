import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import { selectJobSchema } from "@workspace/drizzle/schemas";
import { JobStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";

import { leadBaseContract } from "./lead.contract-base";

const tags = ["Organization", "Lead", "Job"];

const listLeadJobsContract = leadBaseContract
  .route({
    path: "/leads/jobs/list",
    description: "list of jobs",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectJobSchema>({
      orderFields: ["serviceAt", "createdAt"],
      searchFields: ["title"],
      filter: z.object({
        status: JobStatusEnumSchema.optional(),
      }),
    }).extend({
      leadId: z.uuid(),
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
            serviceAt: true,
            createdAt: true,
            receivedRevenue: true,
            expectedRevenue: true,
            invoicedRevenue: true,
          })
          .extend({
            createdBy: userProfileSchema,
          })
      )
    )
  );
export type ListLeadJobsInput = InferContractRouterInputs<
  typeof listLeadJobsContract
>;
export type ListLeadJobsOutput = InferContractRouterOutputs<
  typeof listLeadJobsContract
>["data"];

export const leadJobContract = {
  list: listLeadJobsContract,
};
