"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { downloadFile } from "@workspace/ui/lib/downloadFile";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useUserExportData({
  onRequestStart,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "export_user_data_toast_id";

  return useMutation(
    orpcTQClient.user.export.mutationOptions({
      onMutate: () => {
        toast.loading("Exporting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: ({ message, data }) => {
        const content =
          typeof data.data === "string"
            ? data.data
            : JSON.stringify(data.data, null, 2);

        downloadFile(content, data.filename, data.contentType);
        toast.success(message, { id: toastId });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);
        toast.error(message, { id: toastId });
        onError?.(message);
      },
    })
  );
}

export function useUserUpdate<TFieldNames>({
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "update_user_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.user.update.mutationOptions({
      onMutate: () => {
        toast.loading("Updating user...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.user.list.queryKey({
            input: {},
          }),
          exact: false,
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }
        toast.error(message ?? "Failed to update user", { id: toastId });

        onError?.(message);
      },
    })
  );
}

export function useRoleUpdate<TFieldNames>({
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "update_role_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.user.updateRole.mutationOptions({
      onMutate: () => {
        toast.loading("Updating role...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.user.list.queryKey({
            input: {},
          }),
          exact: false,
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to update role", { id: toastId });

        onError?.(message);
      },
    })
  );
}
