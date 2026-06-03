"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatApiError } from "@/utils/formatApiError";

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
          formatApiError<TFieldNames>(error);

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
          formatApiError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to update role", { id: toastId });

        onError?.(message);
      },
    })
  );
}

export function useSetRolePermissions({
  onRequestStart,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors"> = {}) {
  const toastId = "set_role_permissions_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.user.setRolePermissions.mutationOptions({
      onMutate: () => {
        toast.loading("Setting role permissions...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.user.listRole.queryKey(),
          exact: false,
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatApiError(error);

        toast.error(message ?? "Failed to set role permissions", {
          id: toastId,
        });

        onError?.(message);
      },
    })
  );
}
