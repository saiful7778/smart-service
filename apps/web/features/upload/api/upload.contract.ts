import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import { insertFileSchema } from "@workspace/drizzle/schemas";
import { apiOutputZodSchema } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { baseContract } from "@/server/orpc.contract-base";

import { entityTypeEnumSchema } from "../determineStorageType";

const uploadBaseContract = baseContract.errors({
  NOT_FOUND: {
    code: 404,
    success: false,
    message: API_MESSAGES.UPLOAD.NOT_FOUND,
  },
});

const tags = ["Upload"] as const;

const getSignedUploadUrlContract = uploadBaseContract
  .route({
    path: "/upload/get-signed-url",
    description: "Get a signed URL to upload a file",
    tags,
  })
  .input(
    z.object({
      filename: z.string().min(1).max(255),
      entityType: entityTypeEnumSchema,
      mimeType: z.string().min(1),
    })
  )
  .output(
    apiOutputZodSchema(
      z.object({
        signedUrl: z.url(),
        key: z.string(),
        token: z.string(),
        expiresAt: z.date(),
      })
    )
  );
export type GetSignedUploadUrlInput = InferContractRouterInputs<
  typeof getSignedUploadUrlContract
>;
export type GetSignedUploadUrlOutput = InferContractRouterOutputs<
  typeof getSignedUploadUrlContract
>["data"];

const getSignedDownloadUrlContract = uploadBaseContract
  .route({
    path: "/upload/get-download-url",
    description: "Get a signed URL to download a file",
    tags,
  })
  .input(
    z.object({
      key: z.string().min(1),
      entityType: entityTypeEnumSchema,
    })
  )
  .output(
    apiOutputZodSchema(
      z.object({
        signedUrl: z.url(),
      })
    )
  );
export type GetSignedDownloadUrlInput = InferContractRouterInputs<
  typeof getSignedDownloadUrlContract
>;
export type GetSignedDownloadUrlOutput = InferContractRouterOutputs<
  typeof getSignedDownloadUrlContract
>["data"];

const confirmUploadContract = uploadBaseContract
  .route({
    path: "/upload/confirm",
    description: "Confirm a file upload",
    tags,
  })
  .input(
    insertFileSchema
      .pick({
        key: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        entityId: true,
      })
      .extend({
        entityType: entityTypeEnumSchema,
      })
  )
  .output(
    apiOutputZodSchema(
      z.object({
        id: z.uuid(),
        url: z.string().optional(),
        key: z.string(),
      })
    )
  );
export type ConfirmUploadInput = InferContractRouterInputs<
  typeof confirmUploadContract
>;
export type ConfirmUploadOutput = InferContractRouterOutputs<
  typeof confirmUploadContract
>;

const assignFileEntityContract = uploadBaseContract
  .route({
    path: "/upload/assign-entity",
    description: "Assign a file to an entity",
    tags,
  })
  .input(
    z.object({
      key: z.string().min(1),
      entityType: z.string().min(1),
      entityId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type AssignFileEntityInput = InferContractRouterInputs<
  typeof assignFileEntityContract
>;
export type AssignFileEntityOutput = InferContractRouterOutputs<
  typeof assignFileEntityContract
>["data"];

const deleteUploadContract = uploadBaseContract
  .route({
    path: "/upload/delete",
    description: "Delete a previously uploaded file",
    tags,
  })
  .input(
    z.object({
      key: z.string().min(1),
      entityType: entityTypeEnumSchema,
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type DeleteUploadInput = InferContractRouterInputs<
  typeof deleteUploadContract
>;
export type DeleteUploadOutput = InferContractRouterOutputs<
  typeof deleteUploadContract
>["data"];

export const uploadContract = {
  getSignedUploadUrl: getSignedUploadUrlContract,
  getSignedDownloadUrl: getSignedDownloadUrlContract,
  confirm: confirmUploadContract,
  assignEntity: assignFileEntityContract,
  delete: deleteUploadContract,
};
