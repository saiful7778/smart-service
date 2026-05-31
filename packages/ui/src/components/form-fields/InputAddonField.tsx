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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";

interface InputAddonFieldProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  firstAddon?: React.ReactNode;
  secondAddon?: React.ReactNode;
}

function InputAddonField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  disabled,
  firstAddon,
  secondAddon,
  ...props
}: InputAddonFieldProps<TFieldValues>) {
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
          <InputGroup>
            <InputGroupInput
              {...field}
              {...props}
              id={fieldId}
              aria-invalid={fieldState.invalid}
              disabled={disabled}
            />
            {firstAddon && (
              <InputGroupAddon align="inline-start">
                {firstAddon}
              </InputGroupAddon>
            )}
            {secondAddon && (
              <InputGroupAddon align="inline-end">
                {secondAddon}
              </InputGroupAddon>
            )}
          </InputGroup>
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

export { InputAddonField };
