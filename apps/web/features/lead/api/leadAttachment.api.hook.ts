import { RefObject } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { FileUploadRef, ProgressType } from "@/components/FileUpload";

import { useFileUploadToAPI } from "@/features/upload/hook/useFileUploadToAPI";
import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

import { LeadAttachmentCreateContractType } from "./leadAttachment.contract";

export function useLeadAttachmentCreate<TFieldNames>({
  uploadRef,
  onProgress,
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> & {
  uploadRef: RefObject<FileUploadRef | null>;
  onProgress?: (progress: ProgressType) => void;
}) {
  const toastId = "upload_attachment_toast_message";
  const queryclient = useQueryClient();

  const { mutateAsync: createAttachment } = useMutation(
    orpcTQClient.lead.attachment.create.mutationOptions()
  );
  const { mutateAsync: uploadFile } = useFileUploadToAPI({
    onProgress,
    onSuccess: () => {
      uploadRef.current?.clearFiles();
      uploadRef.current?.clearErrors();
    },
  });

  return useMutation<
    LeadAttachmentCreateContractType["output"],
    Error,
    Omit<LeadAttachmentCreateContractType["input"], "fileId"> & {
      fileValue: File | File[];
    }
  >({
    mutationKey: ["attachment-create"],
    mutationFn: async ({ fileValue, ...restInput }) => {
      const { data } = await uploadFile({
        file: Array.isArray(fileValue) ? fileValue[0]! : fileValue,
        entityId: (restInput.jobId ?? restInput.leadId)!,
        entityType: restInput.jobId ? "job_attachment" : "lead_attachment",
        path: restInput.jobId ? "job_attachment" : "lead_attachment",
      });

      return createAttachment({ ...restInput, fileId: data.id });
    },
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
  });
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
