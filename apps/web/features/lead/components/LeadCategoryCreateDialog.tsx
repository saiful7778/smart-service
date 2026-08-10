"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { toSlug } from "@workspace/lib/utils";
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
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import { useLeadCategoryCreate } from "../api/lead.api.hook";
import { leadCategorySchema, LeadCategoryType } from "../lead.schema";
import { LeadCategoryForm } from "./forms/LeadCategoryForm";

export function LeadCategoryCreateDialog() {
  "use no memo";
  const [open, setOpen] = useState<boolean>(false);

  const form = useForm<LeadCategoryType>({
    resolver: zodResolver(leadCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const { mutate, isPending } = useLeadCategoryCreate<keyof LeadCategoryType>({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
    onValidationErrors: (errors) => {
      errors.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const nameValue = useWatch({
    control: form.control,
    name: "name",
  });

  useEffect(() => {
    form.setValue("slug", toSlug(nameValue), { shouldValidate: true });
  }, [nameValue, form]);

  const formId = "lead_category_create_form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Create New</DialogTrigger>
      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Create Lead Category</DialogTitle>
          <DialogDescription>Create a new lead category</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <LeadCategoryForm
            formId={formId}
            form={form}
            onSubmit={mutate}
            isPending={isPending}
          />
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Create
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
