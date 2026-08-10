import z from "zod";

import {
  selectJobSchema,
  selectOrgTaskSchema,
} from "@workspace/drizzle/schemas";
import {
  TaskPriorityEnumSchema,
  TaskStatusEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { taskCreateSchema, taskUpdateSchema } from "../task.schema";
import { taskBaseContract } from "./task.contract-base";

const tags = ["Task", "Organization"] as const;

const listOrgTasksContract = taskBaseContract
  .route({
    path: "/tasks/org/list",
    description: "List of org tasks",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectOrgTaskSchema>({
      orderFields: ["dueDate", "createdAt"],
      searchFields: ["title"],
      filter: z.object({
        status: TaskStatusEnumSchema.optional(),
        priority: TaskPriorityEnumSchema.optional(),
        createdAt: z
          .object({
            from: z.date().describe("Created at from date").optional(),
            to: z.date().describe("Created at to date").optional(),
          })
          .optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectOrgTaskSchema
          .pick({
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            job: selectJobSchema
              .pick({
                id: true,
                title: true,
              })
              .nullable(),
            assignedByMember: userProfileSchema.nullable(),
            createdByMember: userProfileSchema,
          })
      )
    )
  );
export type ListOrgTaskContractType = InferContractRouterType<
  typeof listOrgTasksContract
>;

const orgTaskDetailsContract = taskBaseContract
  .route({
    path: "/tasks/org/details",
    description: "Org Task details",
    tags,
  })
  .input(z.object({ taskId: z.uuid() }))
  .output(
    apiOutputZodSchema(
      selectOrgTaskSchema
        .pick({
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          job: selectJobSchema
            .pick({
              id: true,
              title: true,
            })
            .nullable(),
          assignedByMember: userProfileSchema.nullable(),
          createdByMember: userProfileSchema,
        })
    )
  );
export type OrgTaskDetailsContractType = InferContractRouterType<
  typeof orgTaskDetailsContract
>;

const orgTaskCreateContract = taskBaseContract
  .route({
    path: "/tasks/create",
    description: "Create new org task",
    tags,
  })
  .input(taskCreateSchema)
  .output(
    apiOutputZodSchema(
      selectOrgTaskSchema.pick({
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      })
    )
  );
export type OrgTaskCreateContractType = InferContractRouterType<
  typeof orgTaskCreateContract
>;

const orgTaskUpdateContract = taskBaseContract
  .route({
    path: "/tasks/org/update",
    description: "Update org task",
    tags,
  })
  .input(taskUpdateSchema.extend({ taskId: z.uuid() }))
  .output(
    apiOutputZodSchema(
      selectOrgTaskSchema.pick({
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      })
    )
  );
export type OrgTaskUpdateContractType = InferContractRouterType<
  typeof orgTaskUpdateContract
>;

const orgTaskDeleteContract = taskBaseContract
  .route({
    path: "/tasks/org/delete",
    description: "Delete org task",
    tags,
  })
  .input(z.object({ taskId: z.uuid() }))
  .output(apiOutputZodSchema(z.null()));
export type OrgTaskDeleteContractType = InferContractRouterType<
  typeof orgTaskDeleteContract
>;

export const orgTaskContract = {
  list: listOrgTasksContract,
  details: orgTaskDetailsContract,
  create: orgTaskCreateContract,
  update: orgTaskUpdateContract,
  delete: orgTaskDeleteContract,
};
