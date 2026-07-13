"use client";

import { createContext, useContext, useState } from "react";

import { RotateCcw } from "lucide-react";

import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";

import {
  useLeadAttachmentBinDelete,
  useLeadAttachmentDelete,
  useLeadAttachmentRestore,
} from "../../api/lead.api.hook";

interface LeadAttachmentContextProps {
  leadId: string | null | undefined;
  jobId: string | null | undefined;

  handleDeleteDialog: (attachmentId: string) => void;
  handleRestoreDialog: (attachmentId: string) => void;
  handleBinDeleteDialog: (attachmentId: string) => void;
}

const LeadAttachmentContext = createContext<LeadAttachmentContextProps | null>(
  null
);

interface LeadAttachmentContextProviderProps {
  children: React.ReactNode;
  leadId: string | null | undefined;
  jobId: string | null | undefined;
  attachments: Array<{ id: string }>;
}

export function LeadAttachmentContextProvider({
  children,
  leadId,
  jobId,
  attachments,
}: LeadAttachmentContextProviderProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [openBinDeleteDialog, setOpenBinDeleteDialog] =
    useState<boolean>(false);

  const [attachmentToAction, setAttachmentToAction] = useState<{
    id: string;
  } | null>(null);

  const { mutate: deleteLeadAttachment, isPending: isLeadAttachmentDeleting } =
    useLeadAttachmentDelete({
      onSuccess: () => {
        setOpenDeleteDialog(false);
        setAttachmentToAction(null);
      },
    });
  const {
    mutate: restoreLeadAttachment,
    isPending: isLeadAttachmentRestoring,
  } = useLeadAttachmentRestore({
    onSuccess: () => {
      setOpenRestoreDialog(false);
      setAttachmentToAction(null);
    },
  });
  const {
    mutate: deleteBinLeadAttachment,
    isPending: isBinLeadAttachmentDeleting,
  } = useLeadAttachmentBinDelete({
    onSuccess: () => {
      setOpenBinDeleteDialog(false);
      setAttachmentToAction(null);
    },
  });

  const handleFileDelete = () => {
    if (!attachmentToAction) return;
    deleteLeadAttachment({
      jobId,
      leadId,
      attachmentId: attachmentToAction.id,
    });
  };

  const handleDeleteDialog = (attachmentId: string) => {
    const attachment = attachments.find(({ id }) => id === attachmentId);
    if (!attachment) return;
    setAttachmentToAction(attachment);
    setOpenDeleteDialog(true);
  };

  const handleFileRestore = () => {
    if (!attachmentToAction) return;
    restoreLeadAttachment({
      jobId,
      leadId,
      attachmentId: attachmentToAction.id,
    });
  };

  const handleRestoreDialog = (attachmentId: string) => {
    const attachment = attachments.find(({ id }) => id === attachmentId);
    if (!attachment) return;
    setAttachmentToAction(attachment);
    setOpenRestoreDialog(true);
  };

  const handleBinFileDelete = () => {
    if (!attachmentToAction) return;
    deleteBinLeadAttachment({
      jobId,
      leadId,
      attachmentId: attachmentToAction.id,
    });
  };

  const handleBinDeleteDialog = (attachmentId: string) => {
    const attachment = attachments.find(({ id }) => id === attachmentId);
    if (!attachment) return;
    setAttachmentToAction(attachment);
    setOpenBinDeleteDialog(true);
  };

  return (
    <LeadAttachmentContext.Provider
      value={{
        leadId,
        jobId,
        handleDeleteDialog,
        handleRestoreDialog,
        handleBinDeleteDialog,
      }}
    >
      {children}

      <DeleteConfirmDialog
        title="Delete Attachment"
        description="Are you sure you want to delete this attachment?"
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleFileDelete}
        isLoading={isLeadAttachmentDeleting}
      />
      <DeleteConfirmDialog
        open={openRestoreDialog}
        onOpenChange={setOpenRestoreDialog}
        onConfirm={handleFileRestore}
        isLoading={isLeadAttachmentRestoring}
        icon={<RotateCcw className="size-4 text-primary" />}
        title="Restore Attachment"
        description="Are you sure you want to restore this item? It will become active again."
        confirmText="Restore"
      />
      <DeleteConfirmDialog
        open={openBinDeleteDialog}
        onOpenChange={setOpenBinDeleteDialog}
        onConfirm={handleBinFileDelete}
        isLoading={isBinLeadAttachmentDeleting}
        title="Delete Permanently?"
        description="This item will be permanently deleted from the bin and cannot be recovered. Are you sure you want to continue?"
        confirmText="Delete Permanently"
      />
    </LeadAttachmentContext.Provider>
  );
}

export function useLeadAttachmentContext() {
  const context = useContext(LeadAttachmentContext);
  if (context === null) {
    throw new Error("LeadAttachmentContextProvider is not provided");
  }
  return context;
}
