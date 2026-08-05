"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";
import { RestoreConfirmDialog } from "@workspace/ui/components/restore-confirm-dialog";

import {
  useMaterialBinDelete,
  useMaterialRestore,
} from "../../api/material.api.hook";
import { ListMaterialBinContractType } from "../../api/materialBin.contract";

interface MaterialBinTableContextProps {
  handleDeleteDialog: (materialId: string) => void;
  handleRestoreDialog: (materialId: string) => void;
}

const MaterialBinTableContext =
  createContext<MaterialBinTableContextProps | null>(null);

interface MaterialBinTableContextProviderProps extends React.PropsWithChildren {
  data: ListMaterialBinContractType["output"]["data"]["data"];
}

export function MaterialBinTableContextProvider({
  children,
  data,
}: MaterialBinTableContextProviderProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [materialToAction, setMaterialToAction] = useState<
    ListMaterialBinContractType["output"]["data"]["data"][number] | null
  >(null);

  const { mutate: deleteMaterial, isPending: isDeleting } =
    useMaterialBinDelete({
      onSuccess: () => {
        setOpenDeleteDialog(false);
        setMaterialToAction(null);
      },
    });

  const { mutate: restoreMaterial, isPending: isRestoring } =
    useMaterialRestore({
      onSuccess: () => {
        setOpenRestoreDialog(false);
        setMaterialToAction(null);
      },
    });

  const handleDelete = useCallback(() => {
    if (!materialToAction) return;
    deleteMaterial({ materialId: materialToAction.id });
  }, [materialToAction, deleteMaterial]);

  const handleDeleteDialog = useCallback(
    (materialId: string) => {
      const material = data.find((material) => material.id === materialId);
      if (!material) return;
      setOpenDeleteDialog(true);
      setMaterialToAction(material);
    },
    [data]
  );

  const handleRestore = useCallback(() => {
    if (!materialToAction) return;
    restoreMaterial({ materialId: materialToAction.id });
  }, [materialToAction, restoreMaterial]);

  const handleRestoreDialog = useCallback(
    (materialId: string) => {
      const material = data.find((material) => material.id === materialId);
      if (!material) return;
      setOpenRestoreDialog(true);
      setMaterialToAction(material);
    },
    [data]
  );

  return (
    <MaterialBinTableContext.Provider
      value={{ handleDeleteDialog, handleRestoreDialog }}
    >
      {children}

      <RestoreConfirmDialog
        open={openRestoreDialog}
        onOpenChange={setOpenRestoreDialog}
        onConfirm={handleRestore}
        isLoading={isRestoring}
      />
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Permanently?"
        description="This item will be permanently deleted from the bin and cannot be recovered. Are you sure you want to continue?"
        confirmText="Delete Permanently"
      />
    </MaterialBinTableContext.Provider>
  );
}

export function useMaterialBinContext() {
  const context = useContext(MaterialBinTableContext);
  if (context === null) {
    throw new Error("MaterialBinTableContextProvider not found");
  }
  return context;
}
