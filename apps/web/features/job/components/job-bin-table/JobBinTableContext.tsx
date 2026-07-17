"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";
import { RestoreConfirmDialog } from "@workspace/ui/components/restore-confirm-dialog";

import { useJobBinDelete, useJobRestore } from "../../api/job.api.hook";
import { ListJobBinContractType } from "../../api/jobBin.contract";

interface JobBinTableContextProps {
  handleDeleteDialog: (jobId: string) => void;
  handleRestoreDialog: (jobId: string) => void;
}

const JobBinTableContext = createContext<JobBinTableContextProps | null>(null);

interface JobBinTableContextProviderProps extends React.PropsWithChildren {
  data: ListJobBinContractType["output"]["data"]["data"];
}

export function JobBinTableContextProvider({
  children,
  data,
}: JobBinTableContextProviderProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [jobToAction, setJobToAction] = useState<
    ListJobBinContractType["output"]["data"]["data"][number] | null
  >(null);

  const { mutate: deleteJob, isPending: isDeleting } = useJobBinDelete({
    onSuccess: () => {
      setOpenDeleteDialog(false);
      setJobToAction(null);
    },
  });

  const { mutate: restoreJob, isPending: isRestoring } = useJobRestore({
    onSuccess: () => {
      setOpenRestoreDialog(false);
      setJobToAction(null);
    },
  });

  const handleDelete = useCallback(() => {
    if (!jobToAction) return;
    deleteJob({ jobId: jobToAction.id });
  }, [jobToAction, deleteJob]);

  const handleDeleteDialog = useCallback(
    (jobId: string) => {
      const job = data.find((job) => job.id === jobId);
      if (!job) return;
      setOpenDeleteDialog(true);
      setJobToAction(job);
    },
    [data]
  );

  const handleRestore = useCallback(() => {
    if (!jobToAction) return;
    restoreJob({ jobId: jobToAction.id });
  }, [jobToAction, restoreJob]);

  const handleRestoreDialog = useCallback(
    (jobId: string) => {
      const job = data.find((job) => job.id === jobId);
      if (!job) return;
      setOpenRestoreDialog(true);
      setJobToAction(job);
    },
    [data]
  );

  return (
    <JobBinTableContext.Provider
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
    </JobBinTableContext.Provider>
  );
}

export function useJobBinContext() {
  const context = useContext(JobBinTableContext);
  if (context === null) {
    throw new Error("JobBinTableContextProvider not found");
  }
  return context;
}
