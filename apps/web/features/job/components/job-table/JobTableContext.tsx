"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";

import { useJobDelete } from "../../api/job.api.hook";
import { ListJobsContractType } from "../../api/job.contract";
import { JobGeneralInfoUpdateDialog } from "../job-details/details-step/JobGeneralInfoUpdateDialog";
import { JobTimeUpdateDialog } from "../JobTimeUpdateDialog";

interface JobTableContextProps {
  data: ListJobsContractType["output"]["data"]["data"];
  handleDeleteJobDialog: (jobId: string) => void;
  isDeletingJob: boolean;
  handleTimeUpdateDialog: (jobId: string) => void;
  handleInfoUpdateDialog: (jobId: string) => void;
}

const JobTableContext = createContext<JobTableContextProps | null>(null);

interface JobTableContextProviderProps {
  data: ListJobsContractType["output"]["data"]["data"];
  children: React.ReactNode;
}

export function JobTableContextProvider({
  data,
  children,
}: JobTableContextProviderProps) {
  const [openTimeUpdateDialog, setOpenTimeUpdateDialog] =
    useState<boolean>(false);
  const [openInfoUpdateDialog, setOpenInfoUpdateDialog] =
    useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [jobToAction, setJobToAction] = useState<
    ListJobsContractType["output"]["data"]["data"][number] | null
  >(null);

  const handleDeleteJobDialog = useCallback(
    (jobId: string) => {
      const job = data.find((job) => job.id === jobId);
      if (job) {
        setJobToAction(job);
        setOpenDeleteDialog(true);
      }
    },
    [data]
  );

  const { mutate: deleteJob, isPending: isDeletingJob } = useJobDelete({
    onSuccess: () => {
      setOpenDeleteDialog(false);
      setJobToAction(null);
    },
  });

  const handleDeleteJob = useCallback(() => {
    if (jobToAction) {
      deleteJob({ jobId: jobToAction.id });
    }
  }, [deleteJob, jobToAction]);

  const handleTimeUpdateDialog = useCallback(
    (jobId: string) => {
      const job = data.find((job) => job.id === jobId);
      if (job) {
        setJobToAction(job);
        setOpenTimeUpdateDialog((prev) => !prev);
      }
    },
    [data]
  );

  const handleInfoUpdateDialog = useCallback(
    (jobId: string) => {
      const job = data.find((job) => job.id === jobId);
      if (job) {
        setJobToAction(job);
        setOpenInfoUpdateDialog((prev) => !prev);
      }
    },
    [data]
  );

  return (
    <JobTableContext.Provider
      value={{
        data,
        handleDeleteJobDialog,
        isDeletingJob,
        handleTimeUpdateDialog,
        handleInfoUpdateDialog,
      }}
    >
      {children}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDeleteJob}
        isLoading={isDeletingJob}
        title={`Delete "${jobToAction?.title}" job`}
      />
      <JobTimeUpdateDialog
        open={openTimeUpdateDialog}
        onOpenChange={setOpenTimeUpdateDialog}
        leadId={jobToAction?.leadId || undefined}
        initialData={
          jobToAction
            ? {
                jobId: jobToAction.id,
                serviceAt: jobToAction?.serviceAt || undefined,
              }
            : undefined
        }
      />
      <JobGeneralInfoUpdateDialog
        open={openInfoUpdateDialog}
        onOpenChange={setOpenInfoUpdateDialog}
        leadId={jobToAction?.leadId || undefined}
        jobId={jobToAction?.id}
        initialData={
          jobToAction
            ? {
                title: jobToAction?.title || "",
                description: jobToAction?.description || "",
                status: jobToAction?.status,
                serviceAt: jobToAction?.serviceAt || undefined,
              }
            : undefined
        }
      />
    </JobTableContext.Provider>
  );
}

export function useJobTableContext() {
  const context = useContext(JobTableContext);
  if (context === null) {
    throw new Error(
      "useJobTableContext must be used within a JobTableContextProvider"
    );
  }
  return context;
}
