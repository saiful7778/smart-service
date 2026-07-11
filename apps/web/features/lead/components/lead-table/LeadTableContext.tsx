"use client";

import { createContext, useCallback, useContext, useState } from "react";

import toast from "react-hot-toast";

import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";

import { useLeadDelete } from "../../api/lead.api.hook";
import { ListLeadOutputs } from "../../api/lead.contract";
import { GeneralInfoUpdateDialog } from "../lead-details/details-step/GeneralInfo";

interface LeadTableContextProps {
  data: ListLeadOutputs["data"];
  handleGeneralUpdateDialog: (leadId: string) => void;
  handleDeleteDialog: (leadId: string) => void;
}

const LeadTableContext = createContext<LeadTableContextProps | undefined>(
  undefined
);

interface LeadTableContextProviderProps {
  children: React.ReactNode;
  data: ListLeadOutputs["data"];
}

export function LeadTableContextProvider({
  children,
  data,
}: LeadTableContextProviderProps) {
  const [openGeneralUpdateDialog, setOpenGeneralUpdateDialog] =
    useState<boolean>(false);
  const [leadToAction, setLeadToAction] = useState<
    ListLeadOutputs["data"][number] | null
  >(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const handleGeneralUpdateDialog = useCallback(
    (leadId: string) => {
      const lead = data.find((lead) => lead.id === leadId);
      if (!lead) {
        toast.error("Lead not found");
        return;
      }
      setOpenGeneralUpdateDialog(true);
      setLeadToAction(lead);
    },
    [data]
  );

  const { mutate, isPending } = useLeadDelete({
    onRequestEnd: () => {
      setOpenDeleteDialog(false);
      setLeadToAction(null);
    },
  });

  const handleDelete = useCallback(() => {
    if (!leadToAction) return;
    mutate({ leadId: leadToAction.id });
  }, [leadToAction, mutate]);

  const handleDeleteDialog = useCallback(
    (leadId: string) => {
      const lead = data.find((lead) => lead.id === leadId);
      if (!lead) {
        toast.error("Lead not found");
        return;
      }
      setOpenDeleteDialog(true);
      setLeadToAction(lead);
    },
    [data]
  );

  return (
    <LeadTableContext.Provider
      value={{ data, handleGeneralUpdateDialog, handleDeleteDialog }}
    >
      {children}

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDelete}
        isLoading={isPending}
      />
      <GeneralInfoUpdateDialog
        open={openGeneralUpdateDialog}
        onOpenChange={setOpenGeneralUpdateDialog}
        initialData={
          leadToAction
            ? {
                leadId: leadToAction.id,
                status: leadToAction.status,
                serviceType: leadToAction.serviceType,
                leadCategories: leadToAction.leadCategories,
                description: leadToAction.description,
              }
            : undefined
        }
      />
    </LeadTableContext.Provider>
  );
}

export function useLeadTableContext() {
  const context = useContext(LeadTableContext);
  if (context === undefined) {
    throw new Error(
      "useLeadTableContext must be used within LeadTableContextProvider"
    );
  }
  return context;
}
