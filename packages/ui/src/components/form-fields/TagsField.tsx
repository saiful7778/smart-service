"use client";
import { useId } from "react";

import { Asterisk, CheckIcon, Info } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import {
  Tags,
  TagsContent,
  TagsContentProps,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsTriggerProps,
  TagsValue,
} from "@workspace/ui/components/kibo-ui/tags/index";

type TagType = {
  value: string;
  label: string;
};

export interface TagsFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  options: TagType[];
  isDescriptionInfoIconShow?: boolean;
  placeholder?: string;
  triggerProps?: TagsTriggerProps;
  contentProps?: TagsContentProps;
  requiredField?: boolean;
  disabled?: boolean;
}

function TagsField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  placeholder,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  options,
  disabled,
  triggerProps,
  contentProps,
}: TagsFieldProps<TFieldValues>) {
  const fieldId = useId();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedTags = (field.value || []) as string[];

        const handleSelect = (tagValue: string) => {
          field.onChange([...selectedTags, tagValue]);
        };

        const handleRemove = (tagValue: string) => {
          field.onChange(selectedTags.filter((t) => t !== tagValue));
        };

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
            <Tags>
              <TagsTrigger
                placeholder={placeholder}
                name={field.name}
                id={fieldId}
                {...triggerProps}
              >
                {selectedTags?.map((tag) => (
                  <TagsValue
                    key={`${name}.${tag}`}
                    onRemove={() => handleRemove(tag)}
                  >
                    {options.find(({ value }) => value === tag)?.label}
                  </TagsValue>
                ))}
              </TagsTrigger>
              <TagsContent align="start" side="bottom" {...contentProps}>
                <TagsInput placeholder="Search..." />
                <TagsList>
                  <TagsEmpty />
                  <TagsGroup>
                    {options.map((option) => {
                      const isSelected =
                        selectedTags.findIndex((t) => t === option.value) !==
                        -1;

                      return (
                        <TagsItem
                          key={`${name}.${option.value}`}
                          onSelect={() => handleSelect(option.value)}
                          value={option.value}
                          disabled={isSelected}
                          aria-disabled={isSelected}
                          aria-selected={isSelected}
                        >
                          {option.label}
                          {isSelected && (
                            <CheckIcon className="text-muted-foreground size-4" />
                          )}
                        </TagsItem>
                      );
                    })}
                  </TagsGroup>
                </TagsList>
              </TagsContent>
            </Tags>
            {description && (
              <FieldDescription
                className="flex items-start gap-1.5"
                aria-disabled={disabled}
              >
                {isDescriptionInfoIconShow && (
                  <Info className="mt-0.5 size-4" />
                )}
                {description}
              </FieldDescription>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export { TagsField };
