"use client";

import { Controller, UseFormReturn } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@workspace/ui/components/input-group";

import { LeadNoteType } from "../../lead.schema";

interface LeadNoteFormProps {
  formId?: string;
  form: UseFormReturn<LeadNoteType>;
  onSubmit: (e: LeadNoteType) => void;
  isSubmitting: boolean;
}

export function LeadNoteForm({
  form,
  formId = "lead_note_form",
  onSubmit,
  isSubmitting,
}: LeadNoteFormProps) {
  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <InputGroup>
                <InputGroupTextarea
                  {...field}
                  placeholder="Write your note here..."
                  className="min-h-25"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                />

                <InputGroupAddon align="block-end">
                  <ButtonSpinner
                    type="submit"
                    className="absolute bottom-1.5 right-1.5 z-10"
                    isLoading={isSubmitting}
                  >
                    Add note
                  </ButtonSpinner>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
