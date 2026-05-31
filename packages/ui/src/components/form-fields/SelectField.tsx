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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";

interface SelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  className?: string;
  label?: string;
  description?: string;
  requiredField?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  isDescriptionInfoIconShow?: boolean;
}

function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  className,
  options,
  label,
  placeholder,
  description,
  requiredField = false,
  isDescriptionInfoIconShow = false,
  disabled,
}: SelectFieldProps<TFieldValues>) {
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
          <Select
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
            items={options}
          >
            <SelectTrigger
              id={fieldId}
              aria-invalid={fieldState.invalid}
              className={cn("w-full", className)}
              disabled={disabled}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map(({ value, label }) => (
                <SelectItem key={`${name}.${value}`} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

export { SelectField };
