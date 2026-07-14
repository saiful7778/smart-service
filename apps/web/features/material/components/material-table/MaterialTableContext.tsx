"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";

import { useMaterialDelete } from "../../api/material.api.hook";
import { ListMaterialOutput } from "../../api/material.contract";

interface MaterialTableContextProps {
  handleDeleteDialog: (materialId: string) => void;
}

const MaterialTableContext = createContext<MaterialTableContextProps | null>(
  null
);

export function MaterialTableContextProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: ListMaterialOutput["data"];
}) {
  "use no memo";
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [materialToAction, setMaterialToAction] = useState<
    ListMaterialOutput["data"][number] | null
  >(null);

  const { mutate: deleteMaterial, isPending: isMaterialDeleting } =
    useMaterialDelete({
      onSuccess: () => {
        setMaterialToAction(null);
        setOpenDeleteDialog(false);
      },
    });

  const handleDelete = useCallback(() => {
    if (!materialToAction) return;
    deleteMaterial({ materialId: materialToAction.id });
  }, [materialToAction, deleteMaterial]);

  const handleDeleteDialog = useCallback(
    (materialId: string) => {
      const material = data.find(({ id }) => id === materialId);
      if (!material) return;
      setOpenDeleteDialog(true);
      setMaterialToAction(material);
    },
    [data]
  );

  return (
    <MaterialTableContext.Provider value={{ handleDeleteDialog }}>
      {children}

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDelete}
        isLoading={isMaterialDeleting}
        title={`Delete "${materialToAction?.name}" job`}
      />
    </MaterialTableContext.Provider>
  );
}

export function useMaterialTableContext() {
  const context = useContext(MaterialTableContext);
  if (context === null) {
    throw new Error("'MaterialTableContextProvider' is not provided");
  }
  return context;
}
