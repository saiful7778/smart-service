import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
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
export type ListLeadNotesInputs = InferContractRouterInputs<
  typeof listLeadNotesContract
>;
export type ListLeadNotesOutputs = InferContractRouterOutputs<
  typeof listLeadNotesContract
>["data"];

const leadNoteCreateContract = leadBaseContract
  .route({
    path: "/leads/notes/create",
    description: "Create lead note",
    tags,
  })
  .input(leadNoteSchema)
  .output(apiOutputZodSchema(selectLeadNoteSchema));
export type LeadNoteCreateInputs = InferContractRouterInputs<
  typeof leadNoteCreateContract
>;
export type LeadNoteCreateOutputs = InferContractRouterOutputs<
  typeof leadNoteCreateContract
>["data"];

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
export type LeadNoteUpdateInputs = InferContractRouterInputs<
  typeof leadNoteUpdateContract
>;
export type LeadNoteUpdateOutputs = InferContractRouterOutputs<
  typeof leadNoteUpdateContract
>["data"];

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
export type LeadNoteDeleteInputs = InferContractRouterInputs<
  typeof leadNoteDeleteContract
>;
export type LeadNoteDeleteOutputs = InferContractRouterOutputs<
  typeof leadNoteDeleteContract
>["data"];

export const leadNoteContract = {
  list: listLeadNotesContract,
  create: leadNoteCreateContract,
  delete: leadNoteDeleteContract,
  update: leadNoteUpdateContract,
};
