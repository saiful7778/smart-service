import { usePathname } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useJobCreate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "job_create_toast_message_id";
  const queryClient = useQueryClient();
  const pathname = usePathname();

  return useMutation(
    orpcTQClient.job.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating job...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { leadId }) => {
        if (pathname.startsWith("/dashboard/organization/leads") && leadId) {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.lead.job.list.queryKey({
              input: { leadId },
            }),
            exact: false,
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.job.list.queryKey({
              input: {},
            }),
            exact: false,
          });
        }

        toast.success(message, { id: toastId });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message || "Failed to create job", { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useJobDelete({
  leadId,
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors"> & { leadId?: string } = {}) {
  const toastId = "job_delete_toast_message_id";
  const queryClient = useQueryClient();
  const pathname = usePathname();

  return useMutation(
    orpcTQClient.job.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        if (leadId && pathname.startsWith("/dashboard/organization/leads")) {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.lead.job.list.queryKey({
              input: { leadId },
            }),
            exact: false,
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.job.list.queryKey({
              input: {},
            }),
            exact: false,
          });
        }

        toast.success(message, { id: toastId });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message || "Failed to delete job", { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useJobDeleteAll({
  leadId,
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors"> & { leadId?: string } = {}) {
  const toastId = "job_all_delete_toast_message_id";
  const queryClient = useQueryClient();
  const pathname = usePathname();

  return useMutation(
    orpcTQClient.job.deleteAll.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        if (leadId && pathname.startsWith("/dashboard/organization/leads")) {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.lead.job.list.queryKey({
              input: { leadId },
            }),
            exact: false,
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.job.list.queryKey({
              input: {},
            }),
            exact: false,
          });
        }

        toast.success(message, { id: toastId });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message || "Failed to delete jobs", { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useJobUpdate<TFieldNames>({
  leadId,
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> & { leadId?: string | null | undefined }) {
  const toastId = "job_update_toast_message_id";
  const queryClient = useQueryClient();
  const pathname = usePathname();

  return useMutation(
    orpcTQClient.job.update.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { jobId }) => {
        if (leadId && pathname.startsWith("/dashboard/organization/leads")) {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.lead.job.list.queryKey({
              input: { leadId },
            }),
            exact: false,
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.job.list.queryKey({
              input: {},
            }),
            exact: false,
          });
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.job.details.queryKey({
              input: {
                jobId,
              },
            }),
            exact: false,
          });
        }

        toast.success(message, { id: toastId });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message || "Failed to update job", { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useJobRevenueUpdate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "job_revenue_update_toast_message_id";
  const queryClient = useQueryClient();
  const pathname = usePathname();

  return useMutation(
    orpcTQClient.job.updateRevenue.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message, data: { leadId } }, { jobId }) => {
        if (leadId && pathname.startsWith("/dashboard/organization/leads")) {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.lead.job.list.queryKey({
              input: { leadId },
            }),
            exact: false,
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.job.list.queryKey({
              input: {},
            }),
            exact: false,
          });
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.job.details.queryKey({
              input: {
                jobId,
              },
            }),
            exact: false,
          });
        }

        toast.success(message, { id: toastId });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message || "Failed to update job revenue", { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useJobRestore({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "job_restore_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.job.bin.restore.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Restoring...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.job.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.job.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to restore job", {
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

export function useJobRestoreAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "job_all_restore_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.job.bin.restoreAll.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Restoring...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.job.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.job.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to restore jobs", {
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

export function useJobBinDelete({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "job_bin_delete_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.job.bin.delete.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.job.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.job.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete job", {
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

export function useJobBinDeleteAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "job_all_bin_delete_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.job.bin.deleteAll.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.job.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.job.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete jobs", {
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
