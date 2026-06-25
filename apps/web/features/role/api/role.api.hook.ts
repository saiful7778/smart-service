import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { useOrgStore } from "@/stores/zustand/org/OrgStoreContext";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useCreateOrgRole<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "create_role_toast_message";
  const queryClient = useQueryClient();
  const addOrgRole = useOrgStore((state) => state.addOrgRole);

  return useMutation(
    orpcTQClient.role.createOrgRole.mutationOptions({
      onMutate: () => {
        toast.loading("Creating role...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message, data }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.role.listOrgRole.queryKey(),
          exact: false,
        });

        addOrgRole(data.id, data.role);

        onSuccess?.(message);
      },
      onError: (error) => {
        const { type, message, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useUpdateOrgRole<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "update_role_toast_message";
  const queryClient = useQueryClient();
  const updateOrgRole = useOrgStore((state) => state.updateOrgRole);

  return useMutation(
    orpcTQClient.role.updateOrgRole.mutationOptions({
      onMutate: () => {
        toast.loading("Updating role...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message, data }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.role.listOrgRole.queryKey(),
          exact: false,
        });

        updateOrgRole(data.id, data.role);

        onSuccess?.(message);
      },
      onError: (error) => {
        const { type, message, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useDeleteOrgRole({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "delete_role_toast_message";
  const queryClient = useQueryClient();
  const deleteOrgRole = useOrgStore((state) => state.deleteOrgRole);

  return useMutation(
    orpcTQClient.role.deleteOrgRole.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting role...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { roleId }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.role.listOrgRole.queryKey(),
          exact: false,
        });

        deleteOrgRole(roleId);

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}
