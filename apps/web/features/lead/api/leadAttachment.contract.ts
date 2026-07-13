import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import {
  selectFileSchema,
  selectLeadAttachmentSchema,
} from "@workspace/drizzle/schemas";
import { apiOutputZodSchema } from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";

import { leadAttachmentUploadSchema } from "../lead.schema";
import { leadBaseContract } from "./lead.contract-base";
import { leadAttachmentBinContract } from "./leadAttachmentBin.contract";

const tags = ["Organization", "Lead", "Attachment"] as const;

const leadAttachmentCreateContract = leadBaseContract
  .route({
    path: "/leads/attachment/create",
    method: "POST",
    description: "Create a lead attachment",
    tags,
  })
  .input(leadAttachmentUploadSchema.extend({ fileId: z.uuid() }))
  .output(apiOutputZodSchema(selectLeadAttachmentSchema));
export type LeadAttachmentCreateInputs = InferContractRouterInputs<
  typeof leadAttachmentCreateContract
>;
export type LeadAttachmentCreateOutput = InferContractRouterOutputs<
  typeof leadAttachmentCreateContract
>["data"];

const listLeadAttachmentContract = leadBaseContract
  .route({
    method: "GET",
    path: "/leads/attachment/list",
    description: "Get lead attachment details",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
    })
  )
  .output(
    apiOutputZodSchema(
      z.array(
        selectLeadAttachmentSchema
          .pick({
            id: true,
            leadId: true,
            jobId: true,
            title: true,
            description: true,
            category: true,
            uploadedAt: true,
          })
          .extend({
            uploadedBy: userProfileSchema,
            file: selectFileSchema.pick({
              id: true,
              key: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              uploadedAt: true,
            }),
          })
      )
    )
  );
export type ListLeadAttachmentInputs = InferContractRouterInputs<
  typeof listLeadAttachmentContract
>;
export type ListLeadAttachmentOutput = InferContractRouterOutputs<
  typeof listLeadAttachmentContract
>["data"];

const leadAttachmentDeleteContract = leadBaseContract
  .route({
    path: "/leads/attachment/delete",
    description: "Delete a lead attachment",
    tags,
  })
  .input(
    z.object({
      leadId: z.uuid().nullable().optional(),
      jobId: z.uuid().nullable().optional(),
      attachmentId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type LeadAttachmentDeleteInputs = InferContractRouterInputs<
  typeof leadAttachmentDeleteContract
>;
export type LeadAttachmentDeleteOutput = InferContractRouterOutputs<
  typeof leadAttachmentDeleteContract
>["data"];

export const leadAttachmentContract = {
  list: listLeadAttachmentContract,
  create: leadAttachmentCreateContract,
  delete: leadAttachmentDeleteContract,
  bin: leadAttachmentBinContract,
};
