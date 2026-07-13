"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { RotateCcw } from "lucide-react";

import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";

import { useLeadBinDelete, useLeadRestore } from "../../api/lead.api.hook";
import { ListLeadBinOutputs } from "../../api/leadBin.contract";

interface LeadBinTableContextProps {
  handleDeleteDialog: (leadId: string) => void;
  handleRestoreDialog: (leadId: string) => void;
}

const LeadBinTableContext = createContext<LeadBinTableContextProps | null>(
  null
);

interface LeadBinTableContextProviderProps extends React.PropsWithChildren {
  data: ListLeadBinOutputs["data"];
}

export function LeadBinTableContextProvider({
  children,
  data,
}: LeadBinTableContextProviderProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [leadToAction, setLeadToAction] = useState<
    ListLeadBinOutputs["data"][number] | null
  >(null);

  const { mutate: deleteLead, isPending: isDeleting } = useLeadBinDelete({
    onSuccess: () => {
      setOpenDeleteDialog(false);
      setLeadToAction(null);
    },
  });

  const { mutate: restoreLead, isPending: isRestoring } = useLeadRestore({
    onSuccess: () => {
      setOpenRestoreDialog(false);
      setLeadToAction(null);
    },
  });

  const handleDelete = useCallback(() => {
    if (!leadToAction) return;
    deleteLead({ leadId: leadToAction.id });
  }, [leadToAction, deleteLead]);

  const handleDeleteDialog = useCallback(
    (leadId: string) => {
      const lead = data.find((lead) => lead.id === leadId);
      if (!lead) return;
      setOpenDeleteDialog(true);
      setLeadToAction(lead);
    },
    [data]
  );

  const handleRestore = useCallback(() => {
    if (!leadToAction) return;
    restoreLead({ leadId: leadToAction.id });
  }, [leadToAction, restoreLead]);

  const handleRestoreDialog = useCallback(
    (leadId: string) => {
      const lead = data.find((lead) => lead.id === leadId);
      if (!lead) return;
      setOpenRestoreDialog(true);
      setLeadToAction(lead);
    },
    [data]
  );

  return (
    <LeadBinTableContext.Provider
      value={{ handleDeleteDialog, handleRestoreDialog }}
    >
      {children}

      <DeleteConfirmDialog
        open={openRestoreDialog}
        onOpenChange={setOpenRestoreDialog}
        onConfirm={handleRestore}
        isLoading={isRestoring}
        icon={<RotateCcw className="size-4 text-primary" />}
        title="Restore Item"
        description="Are you sure you want to restore this item? It will become active again."
        confirmText="Restore"
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
    </LeadBinTableContext.Provider>
  );
}

export function useLeadBinContext() {
  const context = useContext(LeadBinTableContext);
  if (context === null) {
    throw new Error("LeadBinTableContextProvider not found");
  }
  return context;
}
