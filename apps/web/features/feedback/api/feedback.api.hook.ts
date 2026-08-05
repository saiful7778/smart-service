"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useCreateFeedbackIssue<TFieldNames>({
  onSuccess,
  onError,
  onRequestStart,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "create_feedback_issue_toast";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.feedback.create.mutationOptions({
      onMutate: () => {
        toast.loading("Submitting issue...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.feedback.list.queryKey({ input: {} }),
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

        toast.error(message || "Failed to submit issue", { id: toastId });

        onError?.(message);
      },
    })
  );
}

export function useReplyFeedbackIssue<TFieldNames>({
  onSuccess,
  onError,
  onRequestStart,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "reply_feedback_issue_toast";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.feedback.reply.mutationOptions({
      onMutate: () => {
        toast.loading("Adding reply...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { issueId }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.feedback.details.queryKey({
            input: { issueId },
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

        toast.error(message || "Failed to add reply", { id: toastId });

        onError?.(message);
      },
    })
  );
}

export function useUpdateFeedbackIssueStatus<TFieldNames>({
  onSuccess,
  onError,
  onRequestStart,
}: Omit<IApiHookInput<TFieldNames>, "onValidationErrors"> = {}) {
  const toastId = "update_feedback_status_toast";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.feedback.updateStatus.mutationOptions({
      onMutate: () => {
        toast.loading("Updating status...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { issueId }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.feedback.details.queryKey({
            input: { issueId },
          }),
          exact: false,
        });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.feedback.list.queryKey({ input: {} }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message || "Failed to update status", { id: toastId });

        onError?.(message);
      },
    })
  );
}
