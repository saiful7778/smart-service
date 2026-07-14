"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";

import { useMaterialCreate } from "../api/material.api.hook";
import { materialSchema, MaterialType } from "../material.schema";
import { MaterialForm } from "./forms/MaterialForm";

export function MaterialCreateForm() {
  "use client";
  const route = useRouter();

  const form = useForm<MaterialType>({
    resolver: zodResolver(materialSchema),
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

  const { mutate, isPending } = useMaterialCreate<keyof MaterialType>({
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

  const formId = "material_create_form";

  const handleSubmit = (e: MaterialType) => {
    mutate(e);
  };

  return (
    <div className="space-y-4">
      <MaterialForm
        formId={formId}
        form={form}
        isPending={isPending}
        onSubmit={handleSubmit}
      />
      <div className="text-left">
        <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
          Create Material
        </ButtonSpinner>
      </div>
    </div>
  );
}
