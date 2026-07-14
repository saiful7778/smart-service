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

import { useMaterialUpdate } from "../api/material.api.hook";
import { materialSchema, MaterialType } from "../material.schema";
import { MaterialForm } from "./forms/MaterialForm";

interface MaterialUpdateDialogProps {
  materialId: string;
  initialData: MaterialType;
}

export function MaterialUpdateDialog({
  materialId,
  initialData,
}: MaterialUpdateDialogProps) {
  "use no memo";
  const [open, setOpen] = useState<boolean>(false);

  const form = useForm<MaterialType>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      description: initialData?.description || "",
      unit: initialData?.unit || "",
      unitPrice: initialData?.unitPrice || "0.00",
      costPrice: initialData?.costPrice || "0.00",
      stockQuantity: initialData?.stockQuantity || "0",
      minimumStockLevel: initialData?.minimumStockLevel || "0",
    },
  });

  const { mutate, isPending } = useMaterialUpdate<keyof MaterialType>({
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

  const formId = "material_update_form";

  const handleSubmit = (e: MaterialType) => {
    mutate({ ...e, materialId });
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
          <span className="sr-only">update material</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Update</p>
        </TooltipContent>
      </Tooltip>

      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Update Material</DialogTitle>
          <DialogDescription>Update material data</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <MaterialForm
            formId={formId}
            form={form}
            onSubmit={handleSubmit}
            isPending={isPending}
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
