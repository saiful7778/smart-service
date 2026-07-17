import z from "zod";

import {
  selectFileSchema,
  selectLeadAttachmentSchema,
} from "@workspace/drizzle/schemas";
import { apiOutputZodSchema } from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { leadBaseContract } from "./lead.contract-base";

const tags = ["Organization", "Lead", "Attachment", "Bin"] as const;

const listLeadAttachmentBinContract = leadBaseContract
  .route({
    method: "GET",
    path: "/leads/attachment/list/bin",
    description: "Get recycle lead attachment details",
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
              uploadedAt: true,
            }),
          })
      )
    )
  );
export type ListLeadAttachmentBinContractType = InferContractRouterType<
  typeof listLeadAttachmentBinContract
>;

const leadAttachmentRestoreContract = leadBaseContract
  .route({
    path: "/leads/attachment/restore",
    description: "Restore deleted lead attachment",
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
export type LeadAttachmentRestoreContractType = InferContractRouterType<
  typeof leadAttachmentRestoreContract
>;

const leadAttachmentBinDeleteContract = leadBaseContract
  .route({
    path: "/leads/attachment/delete/bin",
    description: "Delete bin lead attachment",
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
export type LeadAttachmentBinDeleteContractType = InferContractRouterType<
  typeof leadAttachmentBinDeleteContract
>;

export const leadAttachmentBinContract = {
  list: listLeadAttachmentBinContract,
  restore: leadAttachmentRestoreContract,
  delete: leadAttachmentBinDeleteContract,
};
