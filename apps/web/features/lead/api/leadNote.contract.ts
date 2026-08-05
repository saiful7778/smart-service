import z from "zod";

import {
  selectJobSchema,
  selectLeadNoteSchema,
  selectUserSchema,
} from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { leadNoteSchema } from "@/features/lead/lead.schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { leadBaseContract } from "./lead.contract-base";

const tags = ["Organization", "Lead"] as const;

const listLeadNotesContract = leadBaseContract
  .route({
    path: "/leads/notes/list",
    description: "Get lead notes",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectLeadNoteSchema>({
      orderFields: ["createdAt"],
    }).extend({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectLeadNoteSchema
          .pick({
            id: true,
            leadId: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            createdBy: selectUserSchema
              .pick({
                name: true,
                email: true,
                image: true,
              })
              .extend({
                userId: z.uuid(),
              }),
            job: selectJobSchema
              .pick({
                id: true,
                title: true,
              })
              .nullable(),
          })
      )
    )
  );
export type ListLeadNotesContractType = InferContractRouterType<
  typeof listLeadNotesContract
>;

const leadNoteCreateContract = leadBaseContract
  .route({
    path: "/leads/notes/create",
    description: "Create lead note",
    tags,
  })
  .input(leadNoteSchema)
  .output(apiOutputZodSchema(selectLeadNoteSchema));
export type LeadNoteCreateContractType = InferContractRouterType<
  typeof leadNoteCreateContract
>;

const leadNoteUpdateContract = leadBaseContract
  .route({
    path: "/leads/notes/update",
    description: "Update lead note",
    tags,
  })
  .input(
    leadNoteSchema.extend({
      leadNoteId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(selectLeadNoteSchema));
export type LeadNoteUpdateContractType = InferContractRouterType<
  typeof leadNoteUpdateContract
>;

const leadNoteDeleteContract = leadBaseContract
  .route({
    path: "/leads/notes/delete",
    description: "Delete lead note",
    tags,
  })
  .input(
    z.object({
      leadNoteId: z.uuid(),
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadNoteDeleteContractType = InferContractRouterType<
  typeof leadNoteDeleteContract
>;

export const leadNoteContract = {
  list: listLeadNotesContract,
  create: leadNoteCreateContract,
  delete: leadNoteDeleteContract,
  update: leadNoteUpdateContract,
};
