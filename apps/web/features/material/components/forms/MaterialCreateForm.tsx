"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, PackageMinus, PackageOpen } from "lucide-react";
import { useForm } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputAddonField } from "@workspace/ui/components/form-fields/InputAddonField";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { useMaterialCreate } from "../../api/material.api.hook";
import {
  materialCreateSchema,
  MaterialCreateType,
} from "../../material.schema";

export function MaterialCreateForm() {
  "use no memo";
  const route = useRouter();

  const form = useForm<MaterialCreateType>({
    resolver: zodResolver(materialCreateSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      unit: "",
      unitPrice: "0.00",
      costPrice: "0.00",
      stockQuantity: "0",
      minimumStockLevel: "0",
    },
  });

  const { mutate, isPending } = useMaterialCreate<keyof MaterialCreateType>({
    onSuccess: () => {
      form.reset();
      route.push("/dashboard/organization/materials");
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = (e: MaterialCreateType) => {
    mutate(e);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
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
        <div className="text-left">
          <ButtonSpinner type="submit" isLoading={isPending}>
            Create Material
          </ButtonSpinner>
        </div>
      </FieldGroup>
    </form>
  );
}
