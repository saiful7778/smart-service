"use client";
import { useId } from "react";

import { Asterisk, Info } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Textarea } from "@workspace/ui/components/textarea";

interface TextareaFieldProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"textarea"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
}

function TextareaField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  disabled,
  ...props
}: TextareaFieldProps<TFieldValues>) {
  const fieldId = useId();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={fieldId} aria-disabled={disabled}>
              {label}
              {requiredField && (
                <Asterisk className="-mt-2 size-3 text-destructive" />
              )}
            </FieldLabel>
          )}
          <Textarea
            {...field}
            {...props}
            id={fieldId}
            aria-invalid={fieldState.invalid}
            disabled={disabled}
          />
          {description && (
            <FieldDescription
              className="flex items-start gap-1.5"
              aria-disabled={disabled}
            >
              {isDescriptionInfoIconShow && <Info className="mt-0.5 size-4" />}
              {description}
            </FieldDescription>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { TextareaField };
