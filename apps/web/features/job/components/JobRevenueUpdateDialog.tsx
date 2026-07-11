"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign } from "lucide-react";
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
import { FieldGroup } from "@workspace/ui/components/field";
import { InputAddonField } from "@workspace/ui/components/form-fields/InputAddonField";
import { InputField } from "@workspace/ui/components/form-fields/InputField";

import { useJobRevenueUpdate } from "../api/job.api.hook";
import { jobRevenueUpdateSchema, JobRevenueUpdateType } from "../job.schema";

interface JobRevenueUpdateDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  defaultValues: Omit<JobRevenueUpdateType, "changeReason">;
}

export function JobRevenueUpdateDialog({
  open,
  onOpenChange,
  defaultValues,
}: JobRevenueUpdateDialogProps) {
  "use no memo";
  const form = useForm<JobRevenueUpdateType>({
    resolver: zodResolver(jobRevenueUpdateSchema),
    defaultValues: {
      ...defaultValues,
      changeReason: "",
    },
  });

  const { mutate, isPending } = useJobRevenueUpdate<keyof JobRevenueUpdateType>(
    {
      onSuccess: () => {
        onOpenChange(false);
      },
      onValidationErrors: (fields) => {
        fields.forEach(({ fieldName, message }) => {
          form.setError(fieldName, {
            message,
          });
        });
      },
    }
  );

  const handleSubmit = (e: JobRevenueUpdateType) => {
    mutate(e);
  };

  const formId = "job_revenue_update_form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Update Job Revenue</DialogTitle>
          <DialogDescription>Update job revenue details</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <InputAddonField
                control={form.control}
                name="expectedRevenue"
                label="Expected revenue"
                type="number"
                placeholder="Expected revenue"
                requiredField
                step="0.01"
                min="0"
                disabled={isPending}
                firstAddon={<DollarSign className="size-4" />}
              />
              <InputAddonField
                control={form.control}
                name="invoicedRevenue"
                label="Invoiced revenue"
                type="number"
                placeholder="Invoiced revenue"
                step="0.01"
                min="0"
                disabled={isPending}
                firstAddon={<DollarSign className="size-4" />}
              />
              <InputAddonField
                control={form.control}
                name="receivedRevenue"
                label="Received revenue"
                type="number"
                placeholder="Received revenue"
                step="0.01"
                min="0"
                disabled={isPending}
                firstAddon={<DollarSign className="size-4" />}
              />
              <InputField
                control={form.control}
                name="changeReason"
                label="Change reason"
                placeholder="Change reason"
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
            Update Revenue
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
