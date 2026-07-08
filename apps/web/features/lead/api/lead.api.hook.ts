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
