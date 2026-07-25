"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";

import { useFileUploadState } from "@/components/FileUpload";
import { FileUploadField } from "@/components/form-fields/FileUploadField";

import { RoutePathType } from "@/types";

import { useMaterialCreate } from "../api/material.api.hook";
import { materialSchema, MaterialType } from "../material.schema";
import { MaterialForm } from "./forms/MaterialForm";

export function MaterialCreateForm() {
  "use no memo";
  const { fileValue, setFileValue, fileError, setFileError, uploadRef } =
    useFileUploadState();
  const route = useRouter();
  const formId = "material_create_form";

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
    uploadRef,
    onSuccess: () => {
      form.reset();
      route.push("/dashboard/organization/materials" as RoutePathType);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = async (e: MaterialType) => {
    mutate({ ...e, materialImage: fileValue });
  };

  return (
    <div className="space-y-4">
      <FileUploadField
        label="Material image"
        variant="image"
        ref={uploadRef}
        value={fileValue}
        onChange={setFileValue}
        fieldError={fileError}
        onError={setFileError}
        disabled={isPending}
      />
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
