import { RefObject } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { FileUploadRef, ProgressType } from "@/components/FileUpload";

import { useFileUploadToAPI } from "@/features/upload/hook/useFileUploadToAPI";
import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

import { CreateOrgContractType } from "./org.contract";

export function useOrgCreate<TFieldNames>({
  uploadRef,
  onProgress,
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> & {
  uploadRef: RefObject<FileUploadRef | null>;
  onProgress?: (progress: ProgressType) => void;
}) {
  const toastId = "create_org_toast_message";

  const { mutateAsync: createOrg } = useMutation(
    orpcTQClient.org.create.mutationOptions()
  );
  const { mutateAsync: uploadImage } = useFileUploadToAPI({
    onProgress,
    onSuccess: () => {
      uploadRef.current?.clearFiles();
      uploadRef.current?.clearErrors();
    },
  });

  return useMutation<
    CreateOrgContractType["output"],
    Error,
    Omit<CreateOrgContractType["input"], "imageId"> & {
      logoImage: File | File[] | null | undefined;
    }
  >({
    mutationKey: ["org-create"],
    mutationFn: async ({ logoImage, ...restInput }) => {
      let imageId: string | undefined = undefined;

      if (logoImage) {
        const { data } = await uploadImage({
          file: Array.isArray(logoImage) ? logoImage[0]! : logoImage,
          entityType: "org_logo",
          path: "org_logo",
        });
        imageId = data.id;
      }

      return createOrg({ ...restInput, imageId });
    },
    onMutate: () => {
      toast.loading("Creating...", { id: toastId });
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
  });
}

export function useInviteOrgMember<TFieldNames>({
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const queryClient = useQueryClient();
  const toastId = "invite_org_member_toast_message";

  return useMutation(
    orpcTQClient.org.inviteMember.mutationOptions({
      onMutate: () => {
        toast.loading("Inviting member...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.org.listInvitation.queryKey({ input: {} }),
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

        toast.error(message ?? "Failed to invite member", {
          id: toastId,
        });

        onError?.(message);
      },
    })
  );
}

export function useUpdateMember<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const queryClient = useQueryClient();
  const toastId = "update_member_toast_message";

  return useMutation(
    orpcTQClient.org.updateMember.mutationOptions({
      onMutate: () => {
        toast.loading("Updating member...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.org.listMember.queryKey({ input: {} }),
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

        toast.error(message ?? "Failed to update member", {
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

export function useUpdateInvitation<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "update_invitation_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.org.updateInvitation.mutationOptions({
      onMutate: () => {
        toast.loading("Updating invitation...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.org.listInvitation.queryKey({ input: {} }),
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

        toast.error(message ?? "Failed to update invitation", {
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

export function useDeleteInvitation({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors"> = {}) {
  const queryClient = useQueryClient();
  const toastId = "delete_invitation_toast_message";

  return useMutation(
    orpcTQClient.org.deleteInvitation.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting invitation...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.org.listInvitation.queryKey({ input: {} }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to delete invitation", {
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
