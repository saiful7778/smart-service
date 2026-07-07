"use client";

import { useMemo } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { UseFormReturn } from "react-hook-form";

import { LeadStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import { TagsField } from "@workspace/ui/components/form-fields/TagsField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { orpcTQClient } from "@/server/orpc.client";

import { GeneralInfoType } from "../../lead.schema";

interface GeneralInfoUpdateFormProps {
  form: UseFormReturn<GeneralInfoType>;
  onSubmit: (e: GeneralInfoType) => void;
  formId?: string;
  disabled?: boolean;
}

export function GeneralInfoUpdateForm({
  form,
  onSubmit,
  formId = "general_info_update_form",
  disabled,
}: GeneralInfoUpdateFormProps) {
  "use no memo";
  const { data: leadCategoriesOptions } = useSuspenseQuery(
    orpcTQClient.lead.category.list.queryOptions({
      select: ({ data }) =>
        data.map((category) => ({
          value: category.id,
          label: category.name,
        })),
    })
  );

  const statusOptions = useMemo(() => {
    return LeadStatusEnumSchema.options.map((option) => ({
      value: option,
      label: formatEnumValue(option),
    }));
  }, []);

  const handleSubmit = (e: GeneralInfoType) => {
    onSubmit(e);
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            control={form.control}
            name="status"
            label="Status"
            options={statusOptions}
            requiredField
            disabled={disabled}
          />
          <InputField
            control={form.control}
            name="serviceType"
            label="Service Type"
            disabled={disabled}
          />
        </div>
        <TagsField
          control={form.control}
          name="categories"
          label="Category"
          placeholder="Select categories"
          options={leadCategoriesOptions}
          disabled={disabled}
        />
        <TextareaField
          control={form.control}
          name="description"
          label="Description"
          className="h-30"
          disabled={disabled}
        />
      </FieldGroup>
    </form>
  );
}
