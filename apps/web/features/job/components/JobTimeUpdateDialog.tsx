"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

import { useJobUpdate } from "../api/job.api.hook";
import { jobTimeUpdateSchema, JobTimeUpdateType } from "../job.schema";
import { JobTimeForm } from "./forms/JobTimeForm";

interface JobTimeUpdateDialogProps {
  leadId: string | null | undefined;
  initialData: JobTimeUpdateType | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobTimeUpdateDialog({
  leadId,
  initialData,
  open,
  onOpenChange,
}: JobTimeUpdateDialogProps) {
  "use no memo";
  const form = useForm<JobTimeUpdateType>({
    resolver: zodResolver(jobTimeUpdateSchema),
    defaultValues: {
      jobId: initialData?.jobId,
      serviceAt: initialData?.serviceAt,
    },
  });

  const { mutate, isPending } = useJobUpdate<keyof JobTimeUpdateType>({
    leadId,
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const formId = "job_time_update_form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Update Job Time</DialogTitle>
          <DialogDescription>
            Update the booked time and service time for the job.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <JobTimeForm
            form={form}
            formId={formId}
            isSubmitting={isPending}
            onSubmit={mutate}
          />
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={isPending}
                aria-disabled={isPending}
              />
            }
          >
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Update
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
