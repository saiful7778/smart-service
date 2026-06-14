import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useGetUploadUrl({
  onSuccess,
  onError,
  onRequestStart,
}: Omit<IApiHookInput, "onValidationErrors">) {
  return useMutation(
    orpcTQClient.upload.getSignedUploadUrl.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
      },
      onSuccess: ({ message }) => {
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);
        onError?.(message);
      },
    })
  );
}

export function useGetDownloadUrl({
  onSuccess,
  onError,
  onRequestStart,
}: Omit<IApiHookInput, "onValidationErrors">) {
  return useMutation(
    orpcTQClient.upload.getSignedDownloadUrl.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
      },
      onSuccess: ({ message }) => {
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);
        onError?.(message);
      },
    })
  );
}

export function useConfirmUpload({
  onSuccess,
  onError,
  onRequestStart,
}: Omit<IApiHookInput, "onValidationErrors">) {
  return useMutation(
    orpcTQClient.upload.confirm.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
      },
      onSuccess: ({ message }) => {
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);
        onError?.(message);
      },
    })
  );
}

export function useDeleteUpload({
  onRequestStart,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "file_upload_delete_toast_message";

  return useMutation(
    orpcTQClient.upload.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting file...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: ({ message }) => {
        toast.success(message, { id: toastId });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);
        toast.error(message ?? "Failed to delete file", {
          id: toastId,
        });
        onError?.(message);
      },
    })
  );
}

export function useAssignFileEntity({
  onRequestStart,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors"> = {}) {
  return useMutation(
    orpcTQClient.upload.assignEntity.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
      },
      onSuccess: ({ message }) => {
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);
        onError?.(message);
      },
    })
  );
}
