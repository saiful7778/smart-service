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
import { formatCurrency } from "@/utils/formatCurrency";

import { ListMaterialForSearchContractType } from "../api/material.contract";

interface MaterialSelectorFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  onSelected?: (
    value:
      ListMaterialForSearchContractType["output"]["data"][number] | undefined
  ) => void;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
}

export function MaterialSelectorField<TFieldValues extends FieldValues>({
  name,
  control,
  onSelected,
  label,
  description,
  isDescriptionInfoIconShow,
  requiredField,
  disabled = false,
}: MaterialSelectorFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <MaterialSelectorFieldRender
          field={field}
          fieldState={fieldState}
          onSelected={onSelected}
          label={label}
          description={description}
          isDescriptionInfoIconShow={isDescriptionInfoIconShow}
          requiredField={requiredField}
          disabled={disabled}
        />
      )}
    />
  );
}

interface MaterialSelectorFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  onSelected?: (
    value:
      ListMaterialForSearchContractType["output"]["data"][number] | undefined
  ) => void;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
}

function MaterialSelectorFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  onSelected,
  label,
  description,
  isDescriptionInfoIconShow,
  requiredField,
  disabled = false,
}: MaterialSelectorFieldRenderProps<TFieldValues>) {
  const fieldId = useId();
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.material.listForSearch.queryOptions({
      input: {
        search,
        searchFields: ["name", "sku"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
      },
    })
  );

  const handleOnChange = useCallback(
    (value: string | undefined) => {
      field.onChange(value);
      onSelected?.(data?.data?.find(({ id }) => id === value));
    },
    [field, onSelected, data?.data]
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
      <SearchableSelector
        value={field.value}
        onChange={handleOnChange}
        onSearch={setSearch}
        disabled={disabled}
      >
        <SearchableSelectorTrigger>
          <UserSearch className="size-4" />
          {field.value ? (
            <span className="truncate">
              {data?.data?.find(({ id }) => id === field.value)?.name}
            </span>
          ) : (
            <span className="text-muted-foreground">Select Material</span>
          )}
        </SearchableSelectorTrigger>
        <SearchableSelectorContent
          data={data?.data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          title="Select Material"
          description="Select a Material"
          loadingFallback={
            <SearchableSelectorLoadingSkeleton>
              <Skeleton className="h-8" />
            </SearchableSelectorLoadingSkeleton>
          }
          emptyFallback={
            <SearchableSelectorEmpty
              message="No materialss found"
              icon={<UserSearch className="size-8 opacity-20" />}
            />
          }
        >
          {(item) => (
            <SearchableSelectorItem
              item={item}
              getItemId={(material) => material.id}
            >
              <span className="flex flex-col">
                <span className="leading-normal text-sm">{item.name}</span>
                <span className="text-muted-foreground">{`SKU: ${item.sku}`}</span>
                <span className="text-muted-foreground leading-none text-xs">
                  {`Price: ${formatCurrency(Number(item.unitPrice))} / ${item.unit}`}
                </span>
                <span className="text-muted-foreground leading-none text-xs">
                  {`Stock: ${item.stockQuantity}`}
                </span>
              </span>
            </SearchableSelectorItem>
          )}
        </SearchableSelectorContent>
      </SearchableSelector>
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
