import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  DEFAULT_INFINITE_PAGE_SIZE,
  DEFAULT_INFINITE_PAGE_START,
} from "@/constants";
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
          exact: false,
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

export function useLeadAddressUpdate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "update_lead_address_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.updateAddress.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });
        if (leadId) {
          await queryclient.invalidateQueries({
            queryKey: orpcTQClient.lead.details.queryKey({
              input: { leadId },
            }),
            exact: false,
          });
        }

        if (jobId) {
          await queryclient.invalidateQueries({
            queryKey: orpcTQClient.job.details.queryKey({
              input: { jobId },
            }),
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

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        queryclient.removeQueries({
          queryKey: orpcTQClient.lead.details.queryKey({
            input: { leadId },
          }),
          exact: false,
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

export function useLeadDeleteAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "delete_all_lead_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.deleteAll.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.category.list.queryKey(),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete leads", {
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

export function useLeadCategoryCreate<TFieldNames>({
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "service_category_create_toastId";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.category.create.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Creating...", {
          id: toastId,
        });
      },
      onSuccess: async ({ message }) => {
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.lead.category.list.queryKey(),
        });
        toast.success(message, {
          id: toastId,
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to create lead category", {
          id: toastId,
        });

        onError?.(message);
      },
    })
  );
}

export function useLeadNoteCreate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "create_note_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.note.create.mutationOptions({
      onMutate: () => {
        toast.loading("Saving note...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { leadId }) => {
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.note.list.infiniteKey({
            input: (pageParam) => ({
              leadId,
              page: pageParam,
            }),
            initialPageParam: DEFAULT_INFINITE_PAGE_START,
          }),
          exact: false,
        });

        toast.success(message, { id: toastId });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to save note", {
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

export function useLeadNoteUpdate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "update_note_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.note.update.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Updating note...", { id: toastId });
      },
      onSuccess: async ({ message }, { leadId }) => {
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.note.list.infiniteKey({
            input: (pageParam) => ({
              leadId,
              order: "desc",
              orderField: "createdAt",
              page: pageParam,
              limit: DEFAULT_INFINITE_PAGE_SIZE,
            }),
            initialPageParam: DEFAULT_INFINITE_PAGE_START,
          }),
          exact: false,
        });

        toast.success(message, { id: toastId });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to update note", {
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

export function useLeadNoteDelete({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors"> = {}) {
  const toastId = "delete_note_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.note.delete.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting note...", { id: toastId });
      },
      onSuccess: async ({ message }, { leadId }) => {
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.note.list.infiniteKey({
            input: (pageParam) => ({
              leadId,
              order: "desc",
              orderField: "createdAt",
              page: pageParam,
              limit: DEFAULT_INFINITE_PAGE_SIZE,
            }),
            initialPageParam: DEFAULT_INFINITE_PAGE_START,
          }),
          exact: false,
        });

        toast.success(message, { id: toastId });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete note", {
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

export function useLeadAttachmentCreate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "upload_attachment_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.attachment.create.mutationOptions({
      onMutate: () => {
        toast.loading("Uploading...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.attachment.list.queryKey({
            input: { leadId, jobId },
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

        toast.error(message ?? "Failed to upload attachment", {
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

export function useLeadAttachmentDelete({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "delete_attachment_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.attachment.delete.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting attachment...", { id: toastId });
      },
      onSuccess: async ({ message }, { leadId, jobId }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.attachment.list.queryKey({
            input: { leadId, jobId },
          }),
          exact: true,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete attachment", {
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
export function useLeadAttachmentRestore({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "lead_attachment_restore_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.attachment.bin.restore.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Restoring...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.attachment.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.attachment.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to restore lead attachment", {
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

export function useLeadAttachmentBinDelete({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "lead_attachment_bin_delete_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.attachment.bin.delete.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.attachment.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.attachment.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete lead attachment", {
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

export function useLeadRestore({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "lead_restore_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.bin.restore.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Restoring...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to restore lead", {
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

export function useLeadRestoreAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "lead_all_restore_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.bin.restoreAll.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Restoring...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to restore leads", {
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

export function useLeadBinDelete({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "lead_bin_delete_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.bin.delete.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.list.queryKey({
            input: {},
          }),
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

export function useLeadBinDeleteAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "lead_all_bin_delete_toast_message";
  const queryclient = useQueryClient();

  return useMutation(
    orpcTQClient.lead.bin.deleteAll.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.bin.list.queryKey({
            input: {},
          }),
          exact: false,
        });
        await queryclient.invalidateQueries({
          queryKey: orpcTQClient.lead.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete leads", {
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
