import z from "zod";

import {
  selectJobScheduleAssignementSchema,
  selectJobScheduleSchema,
} from "@workspace/drizzle/schemas";
import { JobAssignmentStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { jobBaseContract } from "./job.contract-base";

const tags = ["Organization", "Lead", "Job", "Assignment"] as const;

const listJobAssignmentContract = jobBaseContract
  .route({
    path: "/jobs/assignments/list",
    description: "list of jobs assignments",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectJobScheduleAssignementSchema>({
      orderFields: ["createdAt"],
      filter: z.object({
        status: JobAssignmentStatusEnumSchema.optional(),
      }),
    }).extend({
      jobId: z.uuid(),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectJobScheduleAssignementSchema
          .pick({
            id: true,
            role: true,
            status: true,
            acknowledgeAt: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            schedule: selectJobScheduleSchema.pick({
              id: true,
              title: true,
              startAt: true,
              endAt: true,
              createdAt: true,
              updatedAt: true,
            }),
            assignedToMember: userProfileSchema,
          })
      )
    )
  );
export type ListJobAssignmentContractType = InferContractRouterType<
  typeof listJobAssignmentContract
>;

export const jobAssignmentContract = {
  list: listJobAssignmentContract,
};
