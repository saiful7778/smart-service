import { useMutation } from "@tanstack/react-query";

import { IApiHookInput } from "@/types";
import { formatApiError } from "@/utils/formatApiError";

import { useConfirmUpload, useGetUploadUrl } from "../api/upload.api.hook";
import { ConfirmUploadOutput } from "../api/upload.contract";
import { EntityTypeEnumType } from "../determineStorageType";

export type ProgressType = {
  loaded: number;
  total: number;
  percent: number;
};

interface UseFileUploadProps extends Omit<IApiHookInput, "onValidationErrors"> {
  onProgress?: (progress: ProgressType) => void;
}

export function useFileUploadToAPI({
  onProgress,
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: UseFileUploadProps) {
  const { mutateAsync: getUploadUrl } = useGetUploadUrl({});
  const { mutateAsync: confirmUpload } = useConfirmUpload({});

  return useMutation<
    ConfirmUploadOutput,
    Error,
    { file: File; entityType: EntityTypeEnumType; entityId?: string }
  >({
    mutationKey: ["upload-file"],
    mutationFn: async ({ file, entityType, entityId }) => {
      const {
        data: { signedUrl, key },
      } = await getUploadUrl({
        filename: file.name,
        mimeType: file.type,
        entityType,
      });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress({
              loaded: e.loaded,
              total: e.total,
              percent: Math.round((e.loaded / e.total) * 100),
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      return confirmUpload({
        key,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        entityType,
        entityId,
      });
    },
    onMutate: () => {
      onRequestStart?.();
    },
    onSuccess: ({ message }) => {
      onSuccess?.(message);
    },
    onError: (error) => {
      const { message } = formatApiError(error);
      onError?.(message);
    },
    onSettled: () => {
      onRequestEnd?.();
    },
  });
}
