"use client";

import { useCallback, useId } from "react";

import { Asterisk, Info } from "lucide-react";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";

interface InputFieldProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  onInputChange?: (value: string) => void;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
}

function InputField<TFieldValues extends FieldValues>({
  name,
  control,
  onInputChange,
  label,
  description,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  ...props
}: InputFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <InputFieldRender
          field={field}
          fieldState={fieldState}
          onInputChange={onInputChange}
          label={label}
          description={description}
          isDescriptionInfoIconShow={isDescriptionInfoIconShow}
          requiredField={requiredField}
          {...props}
        />
      )}
    />
  );
}

interface InputFieldRenderProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  onInputChange?: (value: string) => void;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
}

function InputFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  onInputChange,
  label,
  description,
  isDescriptionInfoIconShow,
  requiredField,
  disabled = false,
  ...props
}: InputFieldRenderProps<TFieldValues>) {
  const fieldId = useId();

  const handleOnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const value = event.target.value;

      field.onChange(value);
      onInputChange?.(value);
    },
    [field, onInputChange]
  );

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && (
        <FieldLabel htmlFor={fieldId} aria-disabled={disabled}>
          {label}
          {requiredField && (
            <Asterisk className="-mt-2 size-3 text-destructive" />
          )}
        </FieldLabel>
      )}
      <Input
        {...field}
        onChange={handleOnChange}
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
  );
}

export { InputField };
