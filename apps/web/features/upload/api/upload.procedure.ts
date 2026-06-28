import { implement, ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";

import { FileTable } from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { privateStorage, publicStorage } from "@/lib/storage";

import { API_MESSAGES } from "@/constants/apiMessage";
import { authMiddleware } from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { loggerMiddleware } from "@/server/middleware/logger.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { determineStorageType } from "../determineStorageType";
import { uploadContract } from "./upload.contract";

export const uploadImpl = implement(uploadContract)
  .$context<ORPCContext>()
  .use(loggerMiddleware)
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const getSignedUploadUrlProcedure =
  uploadImpl.getSignedUploadUrl.handler(async ({ input }) => {
    const storageType = determineStorageType(input.entityType);

    let signedUrl: {
      signedUrl: string;
      key: string;
      token: string;
      expiresAt: Date;
    };

    if (storageType === "private") {
      signedUrl = await privateStorage.getSignedUploadUrl(
        input.filename,
        input.entityType
      );
    } else {
      signedUrl = await publicStorage.getSignedUploadUrl(
        input.filename,
        input.entityType
      );
    }

    return apiResponse(API_MESSAGES.UPLOAD.GET_SIGNED_URL, {
      signedUrl: signedUrl.signedUrl,
      key: signedUrl.key,
      token: signedUrl.token,
      expiresAt: signedUrl.expiresAt,
    });
  });

export const getSignedDownloadUrlProcedure =
  uploadImpl.getSignedDownloadUrl.handler(async ({ input }) => {
    const storageType = determineStorageType(input.entityType);
    let signedUrl: string;

    if (storageType === "private") {
      signedUrl = await privateStorage.getSignedDownloadUrl(
        input.key,
        input.entityType
      );
    } else {
      signedUrl = await publicStorage.getSignedDownloadUrl(
        input.key,
        input.entityType
      );
    }

    return apiResponse(API_MESSAGES.UPLOAD.GET_DOWNLOAD_URL, {
      signedUrl,
    });
  });

export const confirmUploadProcedure = uploadImpl.confirm.handler(
  async ({ input, context }) => {
    const storageType = determineStorageType(input.entityType);

    let url: string | undefined = undefined;
    if (storageType === "public") {
      url = await publicStorage.getSignedDownloadUrl(
        input.key,
        input.entityType
      );
    }

    const [newFile] = await context.db
      .insert(FileTable)
      .values({
        key: input.key,
        filename: input.filename,
        originalName: input.originalName,
        mimeType: input.mimeType,
        size: input.size,
        uploadedBy: context.user.id,
        entityType: input.entityType,
        entityId: input.entityId,
        ...(url && { url }),
      })
      .returning({ id: FileTable.id });

    if (!newFile) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.UPLOAD.NOT_CREATE,
      });
    }

    return apiResponse(API_MESSAGES.UPLOAD.CONFIRM_UPLOAD, {
      url,
      key: input.key,
      id: newFile.id,
    });
  }
);

export const assignFileEntityProcedure = uploadImpl.assignEntity.handler(
  async ({ input, context, errors }) => {
    const [existFile] = await context.db
      .select({ id: FileTable.id, key: FileTable.key })
      .from(FileTable)
      .where(eq(FileTable.key, input.key))
      .limit(1);

    if (!existFile) {
      throw errors.NOT_FOUND();
    }

    await context.db
      .update(FileTable)
      .set({ entityType: input.entityType, entityId: input.entityId })
      .where(eq(FileTable.id, existFile.id));

    return apiResponse(API_MESSAGES.UPLOAD.ASSIGN_ENTITY, null);
  }
);

export const deleteUploadProcedure = uploadImpl.delete.handler(
  async ({ input, context, errors }) => {
    const [existFile] = await context.db
      .select({ id: FileTable.id, key: FileTable.key })
      .from(FileTable)
      .where(
        and(
          eq(FileTable.key, input.key),
          eq(FileTable.uploadedBy, context.user.id)
        )
      )
      .limit(1);

    if (!existFile) {
      throw errors.NOT_FOUND();
    }

    const storageType = determineStorageType(input.entityType);

    if (storageType === "public") {
      await publicStorage.delete(existFile.key, input.entityType);
    } else {
      await privateStorage.delete(existFile.key, input.entityType);
    }

    await context.db.delete(FileTable).where(eq(FileTable.id, existFile.id));

    return apiResponse(API_MESSAGES.UPLOAD.DELETE, null);
  }
);
