"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { toSlug } from "@/utils/toSlug";

import { useLeadCategoryCreate } from "../../api/lead.api.hook";
import {
  leadCategoryCreateSchema,
  LeadCategoryCreateType,
} from "../../lead.schema";

export function LeadCategoryCreateForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const form = useForm<LeadCategoryCreateType>({
    resolver: zodResolver(leadCategoryCreateSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const { mutate, isPending } = useLeadCategoryCreate<
    keyof LeadCategoryCreateType
  >({
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
    onValidationErrors: (errors) => {
      errors.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = (e: LeadCategoryCreateType) => {
    mutate(e);
  };

  const nameValue = useWatch({
    control: form.control,
    name: "name",
  });

  useEffect(() => {
    form.setValue("slug", toSlug(nameValue), { shouldValidate: true });
  }, [nameValue, form]);

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
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
        <ButtonSpinner type="submit" isLoading={isPending}>
          Create
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
