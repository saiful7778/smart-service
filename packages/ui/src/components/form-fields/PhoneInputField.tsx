"use client";

import { useId } from "react";

import { Asterisk } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import type { Country } from "react-phone-number-input";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { PhoneInput } from "@workspace/ui/components/phone-input";

interface PhoneInputFieldProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  requiredField?: boolean;
  defaultCountry?: Country;
}

function PhoneInputField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  requiredField = false,
  disabled,
  ...props
}: PhoneInputFieldProps<TFieldValues>) {
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
          <PhoneInput
            {...props}
            {...field}
            id={fieldId}
            aria-invalid={fieldState.invalid}
            disabled={disabled}
          />
          {description && (
            <FieldDescription
              className="flex items-start gap-1.5"
              aria-disabled={disabled}
            >
              {description}
            </FieldDescription>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { PhoneInputField };
