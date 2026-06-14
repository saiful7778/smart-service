import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useOrgCreate<TFieldNames>({
  toastId = "create_org_toast_message",
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> & { toastId?: string }) {
  return useMutation(
    orpcTQClient.org.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating organization...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: ({ message }) => {
        toast.success(message, { id: toastId });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to create organization", {
          id: toastId,
        });

        onError?.(message);
      },
    })
  );
}

export function useInviteOrgMember<TFieldNames>({
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "invite_org_member_toast_message";

  return useMutation(
    orpcTQClient.org.inviteMember.mutationOptions({
      onMutate: () => {
        toast.loading("Inviting member...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: ({ message }) => {
        toast.success(message, { id: toastId });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to invite member", {
          id: toastId,
        });

        onError?.(message);
      },
    })
  );
}

export function useAcceptOrRejectInvitation({
  onRequestStart,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors"> = {}) {
  const toastId = "accept_or_reject_invitation_toast_message";

  return useMutation(
    orpcTQClient.org.acceptOrRejectInvitation.mutationOptions({
      onMutate: () => {
        toast.loading("Processing invitation...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: ({ message }) => {
        toast.success(message, { id: toastId });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to process invitation", {
          id: toastId,
        });

        onError?.(message);
      },
    })
  );
}
