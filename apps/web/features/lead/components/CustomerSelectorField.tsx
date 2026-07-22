"use client";

import { useCallback, useId, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Asterisk, Info, UserSearch } from "lucide-react";
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
import { Skeleton } from "@workspace/ui/components/skeleton";

import {
  SearchableSelector,
  SearchableSelectorContent,
  SearchableSelectorEmpty,
  SearchableSelectorItem,
  SearchableSelectorLoadingSkeleton,
  SearchableSelectorTrigger,
} from "@/components/SearchableSelector";

import { DEFAULT_PAGE_INDEX } from "@/constants";
import { orpcTQClient } from "@/server/orpc.client";

interface CustomerSelectorFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
}

export function CustomerSelectorField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow,
  requiredField,
  disabled = false,
}: CustomerSelectorFieldProps<TFieldValues>) {
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
          <CustomerSelectorFieldRender
            field={field}
            fieldState={fieldState}
            id={fieldId}
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

interface CustomerSelectorFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  disabled?: boolean;
  placeholder?: string;
}

function CustomerSelectorFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  disabled = false,
  placeholder = "Select Customer",
}: CustomerSelectorFieldRenderProps<TFieldValues>) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.lead.customer.listForSearch.queryOptions({
      input: {
        search,
        searchFields: ["name", "email"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
      },
    })
  );

  const handleOnChange = useCallback(
    (value: string | undefined) => {
      field.onChange(value);
    },
    [field]
  );

  return (
    <SearchableSelector
      value={field.value}
      onChange={handleOnChange}
      onSearch={setSearch}
      disabled={disabled}
    >
      <SearchableSelectorTrigger id={id} aria-invalid={fieldState.invalid}>
        <UserSearch className="size-4" />
        {field.value ? (
          <span className="truncate">
            {data?.data?.data?.find(({ id }) => id === field.value)?.name}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </SearchableSelectorTrigger>
      <SearchableSelectorContent
        data={data?.data?.data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        title={placeholder}
        description="Select a customer"
        loadingFallback={
          <SearchableSelectorLoadingSkeleton>
            <Skeleton className="h-8" />
          </SearchableSelectorLoadingSkeleton>
        }
        emptyFallback={
          <SearchableSelectorEmpty
            message="No customers found"
            icon={<UserSearch className="size-8 opacity-20" />}
          />
        }
      >
        {(item) => (
          <SearchableSelectorItem
            item={item}
            getItemId={(customer) => customer.id}
          >
            <span className="flex flex-col items-start justify-center gap-0">
              <span className="flex gap-1 items-center">
                <span>{item.name}</span>
                {item.phone && (
                  <span className="text-muted-foreground">
                    {`(${item.phone})`}
                  </span>
                )}
              </span>
              {item.email && (
                <span className="text-muted-foreground">{item.email}</span>
              )}
            </span>
          </SearchableSelectorItem>
        )}
      </SearchableSelectorContent>
    </SearchableSelector>
  );
}
