"use client";

import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";

import { useMaterialDelete } from "../api/material.api.hook";

export function MaterialDeleteDialog({
  materialId,
  open,
  setOpen,
}: {
  materialId: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const { mutate: deleteMaterial, isPending } = useMaterialDelete({
    onSuccess: () => {
      setOpen(false);
    },
  });

  const handleDelete = () => {
    deleteMaterial({ materialId });
  };

  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={handleDelete}
      isLoading={isPending}
      title="Delete this material"
    />
  );
}
