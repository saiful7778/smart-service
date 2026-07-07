"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { LeadStatusEnumType } from "@workspace/drizzle/zod-db-enums";
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

import { useLeadUpdate } from "@/features/lead/api/lead.api.hook";
import {
  generalInfoSchema,
  GeneralInfoType,
} from "@/features/lead/lead.schema";

import { GeneralInfoUpdateForm } from "../../forms/GeneralInfoForm";

interface GeneralInfoUpdateDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  initialData?:
    | {
        leadId: string;
        status: LeadStatusEnumType;
        serviceType: string | null;
        leadCategories: Array<{ id: string; name: string }>;
        description: string | null;
      }
    | undefined;
}

export function GeneralInfoUpdateDialog({
  open,
  onOpenChange,
  initialData,
}: GeneralInfoUpdateDialogProps) {
  const form = useForm<GeneralInfoType>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      status: initialData?.status,
      serviceType: initialData?.serviceType ?? "",
      categories: initialData?.leadCategories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
      description: initialData?.description ?? "",
    },
  });

  const { mutate, isPending } = useLeadUpdate<keyof GeneralInfoType>({
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

  const handleSubmit = (e: GeneralInfoType) => {
    const leadId = initialData?.leadId;
    if (!leadId) return;
    mutate({
      leadId,
      status: e.status,
      serviceType: e.serviceType || null,
      categories: e.categories,
      description: e.description || null,
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Update General Information</DialogTitle>
          <DialogDescription>
            Update the general information of this lead.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          {initialData ? (
            <GeneralInfoUpdateForm
              formId="general_info_update_form"
              form={form}
              onSubmit={handleSubmit}
              disabled={isPending}
            />
          ) : (
            <div className="text-center text-xl font-semibold text-destructive py-8">
              Could not load lead details
            </div>
          )}
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner
            form="general_info_update_form"
            type="submit"
            size="sm"
            isLoading={isPending}
          >
            Update Info
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
