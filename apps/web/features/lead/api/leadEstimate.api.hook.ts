import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useLeadEstimateCreate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "create_estimate_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.estimate.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.material.listForSearch.queryKey({
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

        toast.error(message ?? "Failed to create estimate", {
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

export function useLeadEstimateUpdate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "update_estimate_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.estimate.update.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.material.listForSearch.queryKey({
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

        toast.error(message ?? "Failed to update estimate", {
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

export function useLeadEstimateDelete({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "delete_estimate_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.estimate.delete.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.bin.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.material.listForSearch.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete estimate", {
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

export function useLeadEstimateDeleteAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "delete_all_estimate_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.estimate.deleteAll.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.bin.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.material.listForSearch.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete estimate", {
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

export function useLeadEstimateRestore({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "restore_estimate_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.estimate.bin.restore.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Restoring...", { id: toastId });
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.bin.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.material.listForSearch.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to restore estimate", {
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

export function useLeadEstimateRestoreAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "restore_all_estimate_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.estimate.bin.restoreAll.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Restoring...", { id: toastId });
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.bin.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.material.listForSearch.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to restore estimate", {
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

export function useLeadEstimateBinDelete({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "bin_delete_estimate_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.estimate.bin.delete.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.bin.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.material.listForSearch.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete estimate permanently", {
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

export function useLeadEstimateBinDeleteAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "bin_delete_all_estimate_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.estimate.bin.deleteAll.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.bin.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.estimate.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.material.listForSearch.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete estimate permanently", {
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
