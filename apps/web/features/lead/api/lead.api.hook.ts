import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useLeadCreate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "create_lead_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { categories }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        if (categories && categories.length > 0) {
          await queryclient.invalidateQueries({
            queryKey: orpcTQClient.lead.category.list.queryKey(),
            exact: false,
          });
        }

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to create lead", {
          id: toastId,
        });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useLeadUpdate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "update_lead_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.update.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { leadId, categories }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.details.queryKey({
            input: { leadId },
          }),
          exact: true,
        });

        if (categories) {
          await queryclient.invalidateQueries({
            queryKey: orpcTQClient.lead.category.list.queryKey(),
            exact: false,
          });
        }

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to update lead", {
          id: toastId,
        });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useLeadDelete({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "delete_lead_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { leadId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        queryclient.removeQueries({
          queryKey: orpcTQClient.lead.details.queryKey({
            input: { leadId },
          }),
          exact: true,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.category.list.queryKey(),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete lead", {
          id: toastId,
        });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}
