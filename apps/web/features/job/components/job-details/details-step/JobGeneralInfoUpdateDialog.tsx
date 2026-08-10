"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { JobStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
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
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { useJobUpdate } from "../../../api/job.api.hook";
import { jobUpdateSchema, JobUpdateType } from "../../../job.schema";

const statusOptions = JobStatusEnumSchema.options.map((status) => ({
  value: status,
  label: formatEnumValue(status),
}));

interface JobGeneralInfoUpdateDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  jobId: string | null | undefined;
  initialData: Omit<JobUpdateType, "jobId"> | undefined;
}

export function JobGeneralInfoUpdateDialog({
  open,
  onOpenChange,
  jobId,
  initialData,
}: JobGeneralInfoUpdateDialogProps) {
  "use no memo";
  const form = useForm<JobUpdateType>({
    resolver: zodResolver(jobUpdateSchema),
    defaultValues: {
      jobId: jobId || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      status: initialData?.status || "scheduled",
    },
  });

  const { mutate, isPending } = useJobUpdate<keyof JobUpdateType>({
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

  const onSubmit = (e: JobUpdateType) => {
    if (!e.jobId) return;
    mutate(e);
  };

  const formId = "lead_job_update_form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Update Job</DialogTitle>
          <DialogDescription>Update this job</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <InputField
                control={form.control}
                name="title"
                label="Job Title"
                placeholder="Enter job title"
                requiredField
                disabled={isPending}
              />
              <SelectField
                control={form.control}
                name="status"
                label="Status"
                placeholder="Select a status"
                disabled={isPending}
                requiredField
                options={statusOptions}
              />
              <TextareaField
                control={form.control}
                name="description"
                label="Job Description"
                placeholder="Enter job description"
                rows={4}
                disabled={isPending}
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Update Job
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
