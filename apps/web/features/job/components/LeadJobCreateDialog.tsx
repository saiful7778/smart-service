"use client";

import { useMemo } from "react";

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

import { useJobCreate } from "../api/job.api.hook";
import { jobCreateSchema, JobCreateType } from "../job.schema";

interface LeadJobCreateDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  leadId: string;
}

export function LeadJobCreateDialog({
  open,
  onOpenChange,
  leadId,
}: LeadJobCreateDialogProps) {
  "use no memo";

  const form = useForm<JobCreateType>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      leadId,
      title: "",
      description: "",
      status: "scheduled",
      expectedRevenue: "0.00",
      invoicedRevenue: "0.00",
      receivedRevenue: "0.00",
    },
  });

  const { mutate, isPending } = useJobCreate<keyof JobCreateType>({
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

  const statusOptions = useMemo(
    () =>
      JobStatusEnumSchema.options.map((status) => ({
        value: status,
        label: formatEnumValue(status),
      })),
    []
  );

  const onSubmit = (e: JobCreateType) => {
    mutate(e);
  };

  const formId = "lead_job_create_form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Create Job</DialogTitle>
          <DialogDescription>Create a new job for this lead</DialogDescription>
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
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Create Job
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
