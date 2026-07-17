"use client";

import { RefObject } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { FileUploadRef } from "@/components/FileUpload";

import { useFileUploadToAPI } from "@/features/upload/hook/useFileUploadToAPI";
import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

import { MaterialCreateInput, MaterialCreateOutput } from "./material.contract";

export function useMaterialCreate<TFieldNames>({
  uploadRef,
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> & {
  uploadRef: RefObject<FileUploadRef | null>;
}) {
  const toastId = "material_create_toast_message_id";
  const queryClient = useQueryClient();

  const { mutateAsync: createMaterial } = useMutation(
    orpcTQClient.material.create.mutationOptions()
  );
  const { mutateAsync: updateImage } = useFileUploadToAPI({
    onSuccess: () => {
      uploadRef.current?.clearFiles();
      uploadRef.current?.clearErrors();
    },
  });

  return useMutation<
    MaterialCreateOutput,
    Error,
    Omit<MaterialCreateInput, "fileId"> & {
      materialImage: File | File[] | null | undefined;
    }
  >({
    mutationKey: ["create-material"],
    mutationFn: async ({ materialImage, ...restInput }) => {
      let fileId = undefined;

      if (materialImage) {
        const { data } = await updateImage({
          file: Array.isArray(materialImage)
            ? materialImage[0]!
            : materialImage,
          entityType: "material_file",
          path: "material_file",
        });
        fileId = data.id;
      }

      return createMaterial({ ...restInput, fileId });
    },
    onMutate: () => {
      toast.loading("Creating...", { id: toastId });
      onRequestStart?.();
    },
    onSuccess: async ({ message }) => {
      await queryClient.invalidateQueries({
        queryKey: orpcTQClient.material.list.queryKey({
          input: {},
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

      toast.error(message || "Failed to create material", { id: toastId });

      onError?.(message);
    },
    onSettled: () => {
      onRequestEnd?.();
    },
  });
}

export function useMaterialUpdate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "material_update_toast_message_id";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.material.update.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { materialId }) => {
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.material.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.material.details.queryKey({
            input: { materialId },
          }),
          exact: true,
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

        toast.error(message || "Failed to update material", { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useMaterialDelete({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "material_delete_toast_message_id";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.material.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.material.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        toast.success(message, { id: toastId });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message || "Failed to delete material", { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}
