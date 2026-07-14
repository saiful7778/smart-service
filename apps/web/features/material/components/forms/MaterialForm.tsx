"use client";

import { DollarSign, PackageMinus, PackageOpen } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { FieldGroup } from "@workspace/ui/components/field";
import { InputAddonField } from "@workspace/ui/components/form-fields/InputAddonField";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { MaterialType } from "../../material.schema";

interface MaterialFormProps {
  form: UseFormReturn<MaterialType>;
  formId?: string;
  isPending?: boolean;
  onSubmit: (value: MaterialType) => void;
}

export function MaterialForm({
  form,
  formId = "material_form",
  isPending,
  onSubmit,
}: MaterialFormProps) {
  "use no memo";
  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <InputField
          control={form.control}
          name="name"
          label="Material Name"
          placeholder="Enter name"
          requiredField
          disabled={isPending}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <InputField
              control={form.control}
              name="sku"
              label="Material SKU"
              placeholder="Enter SKU"
              requiredField
              disabled={isPending}
            />
          </div>
          <InputField
            control={form.control}
            name="unit"
            label="Unit"
            placeholder="Enter unit"
            requiredField
            disabled={isPending}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputAddonField
            control={form.control}
            name="unitPrice"
            label="Unit Price"
            type="number"
            placeholder="Unit price"
            requiredField
            step="0.01"
            min="0"
            disabled={isPending}
            firstAddon={<DollarSign className="size-4" />}
          />
          <InputAddonField
            control={form.control}
            name="costPrice"
            label="Cost Price"
            type="number"
            placeholder="Cost price"
            step="0.01"
            min="0"
            disabled={isPending}
            firstAddon={<DollarSign className="size-4" />}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputAddonField
            control={form.control}
            name="stockQuantity"
            label="Stock Quantity"
            type="number"
            placeholder="Stock Quantity"
            requiredField
            min="0"
            disabled={isPending}
            firstAddon={<PackageOpen className="size-4" />}
          />
          <InputAddonField
            control={form.control}
            name="minimumStockLevel"
            label="Minimum Stock Level"
            type="number"
            placeholder="Minimum stock level"
            min="0"
            disabled={isPending}
            firstAddon={<PackageMinus className="size-4" />}
          />
        </div>
        <TextareaField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter description"
          disabled={isPending}
        />
      </FieldGroup>
    </form>
  );
}
