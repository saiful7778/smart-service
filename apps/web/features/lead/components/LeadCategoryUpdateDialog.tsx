"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pen } from "lucide-react";
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
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { useLeadCategoryUpdate } from "../api/lead.api.hook";
import { leadCategorySchema, LeadCategoryType } from "../lead.schema";
import { LeadCategoryForm } from "./forms/LeadCategoryForm";

export function LeadCategoryUpdateDialog({
  initialData,
  categoryId,
}: {
  initialData: LeadCategoryType;
  categoryId: string;
}) {
  "use no memo";
  const [open, setOpen] = useState<boolean>(false);

  const form = useForm<LeadCategoryType>({
    resolver: zodResolver(leadCategorySchema),
    defaultValues: initialData,
  });

  const { mutate, isPending } = useLeadCategoryUpdate<keyof LeadCategoryType>({
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

  const formId = "lead_category_update_form";

  const handleSubmit = (e: LeadCategoryType) => {
    mutate({ ...e, categoryId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger render={<Button size="icon" variant="outline" />} />
          }
        >
          <Pen />
          <span className="sr-only">update category</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Update</p>
        </TooltipContent>
      </Tooltip>

      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Update Lead Category</DialogTitle>
          <DialogDescription>Update lead category</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <LeadCategoryForm
            formId={formId}
            form={form}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="outline" />}>
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
