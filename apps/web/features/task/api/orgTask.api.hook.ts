import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import type { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

import { ListOrgTaskContractType } from "./orgTask.contract";

export function useCreateOrgTask<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "create_org_task_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.task.org.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.task.org.list.queryKey({ input: {} }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { type, message, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useUpdateOrgTask<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "update_org_task_toast_message";
  const queryClient = useQueryClient();
  const listQueryKey = orpcTQClient.task.org.list.queryKey({ input: {} });

  return useMutation(
    orpcTQClient.task.org.update.mutationOptions({
      onMutate: async ({ taskId, status }) => {
        onRequestStart?.();

        await queryClient.cancelQueries({
          queryKey: listQueryKey,
          exact: false,
        });

        const previousData = queryClient.getQueriesData<
          ListOrgTaskContractType["output"]
        >({
          queryKey: listQueryKey,
          exact: false,
        });

        queryClient.setQueriesData(
          {
            queryKey: listQueryKey,
            exact: false,
          },
          (oldData: ListOrgTaskContractType["output"]) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              data: {
                meta: oldData.data.meta,
                data: oldData.data.data.map((task) => {
                  if (task.id === taskId) {
                    return {
                      ...task,
                      status: status ?? task.status,
                    };
                  }
                  return task;
                }),
              },
            };
          }
        );

        return { previousData: previousData[0]![1] };
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        onSuccess?.(message);
      },
      onError: (error, _variables, context) => {
        queryClient.setQueryData(listQueryKey, context?.previousData);

        const { type, message, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: listQueryKey,
          exact: false,
        });

        onRequestEnd?.();
      },
    })
  );
}

export function useDeleteOrgTask({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput) {
  const toastId = "delete_org_task_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.task.org.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.task.org.list.queryKey({ input: {} }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}
