"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";

import { useLeadEstimateSend } from "@/features/lead/api/leadEstimate.api.hook";

import { sendEstimateSchema, SendEstimateType } from "../../lead.schema";

interface SendEstimateDialogProps {
  estimateId: string;
  leadId: string | null | undefined;
  jobId: string | null | undefined;
  customer: { id: string; email: string | null } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendEstimateDialog({
  estimateId,
  leadId,
  jobId,
  customer,
  open,
  onOpenChange,
}: SendEstimateDialogProps) {
  "use no memo";
  const form = useForm<SendEstimateType>({
    resolver: zodResolver(sendEstimateSchema),
    defaultValues: {
      email: customer?.email || "",
    },
  });

  const { mutate, isPending } = useLeadEstimateSend<keyof SendEstimateType>({
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
  });

  const handleSubmit = (e: SendEstimateType) => {
    mutate({
      ...e,
      estimateId,
      leadId,
      jobId,
    });
  };

  const formId = "send_estimate_form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Estimate</DialogTitle>
          <DialogDescription>
            Send this estimate to the customer.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <InputField
              control={form.control}
              type="email"
              name="email"
              label="Email address"
              placeholder="customer@example.com"
              description="Estimate mail will send to this email address"
              disabled={isPending}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isPending} />
            }
          >
            Cancel
          </DialogClose>
          <ButtonSpinner type="submit" form={formId} isLoading={isPending}>
            Send
          </ButtonSpinner>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
