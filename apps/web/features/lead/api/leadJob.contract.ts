import z from "zod";

import { selectJobSchema } from "@workspace/drizzle/schemas";
import { JobStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

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
      orderFields: ["createdAt"],
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
export type ListLeadJobsContractType = InferContractRouterType<
  typeof listLeadJobsContract
>;

export const leadJobContract = {
  list: listLeadJobsContract,
};
