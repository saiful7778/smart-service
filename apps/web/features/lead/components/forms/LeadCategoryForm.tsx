"use client";

import { UseFormReturn } from "react-hook-form";

import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { LeadCategoryType } from "../../lead.schema";

export function LeadCategoryForm({
  form,
  formId = "lead_category_create_form",
  onSubmit,
  isPending,
}: {
  form: UseFormReturn<LeadCategoryType>;
  formId?: string;
  onSubmit: (value: LeadCategoryType) => void;
  isPending: boolean;
}) {
  "use no memo";
  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <InputField
          control={form.control}
          name="name"
          label="Category name"
          placeholder="name"
          requiredField
          disabled={isPending}
        />
        <InputField
          control={form.control}
          name="slug"
          label="Slug"
          placeholder="Enter slug"
          requiredField
          disabled
        />
        <TextareaField
          control={form.control}
          name="description"
          label="Description"
          disabled={isPending}
        />
      </FieldGroup>
    </form>
  );
}
