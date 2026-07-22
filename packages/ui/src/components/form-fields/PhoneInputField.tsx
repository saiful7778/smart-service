"use client";

import { useCallback, useId } from "react";

import { Asterisk } from "lucide-react";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
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
  onValueChange?: (value: string) => void;
}

function PhoneInputField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  requiredField = false,
  disabled,
  onValueChange,
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
          <PhoneInputFieldRender
            field={field}
            fieldState={fieldState}
            onValueChange={onValueChange}
            id={fieldId}
            {...props}
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

interface PhoneInputFieldRenderProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  onValueChange?: (value: string) => void;
}

function PhoneInputFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  onValueChange,
  disabled = false,
  ...props
}: PhoneInputFieldRenderProps<TFieldValues>) {
  const handleChange = useCallback(
    (value: string) => {
      field.onChange(value);
      onValueChange?.(value);
    },
    [field, onValueChange]
  );

  return (
    <PhoneInput
      {...props}
      {...field}
      onChange={handleChange}
      id={id}
      aria-invalid={fieldState.invalid}
      disabled={disabled}
    />
  );
}

export { PhoneInputField };
