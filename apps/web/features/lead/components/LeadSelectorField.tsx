"use client";

import { useId, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Asterisk, Info, UserSearch } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { LeadStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Status,
  StatusLabel,
  StatusVariant,
} from "@workspace/ui/components/status";

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

interface LeadSelectorFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
}

const statusVariantMap: Record<LeadStatusEnumType, StatusVariant> = {
  new: "default",
  contacted: "info",
  qualified: "success",
  nurture: "warning",
  converted: "success",
  lost: "error",
  cancelled: "error",
  disqualified: "error",
};

export function LeadSelectorField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow,
  requiredField,
  disabled = false,
}: LeadSelectorFieldProps<TFieldValues>) {
  const fieldId = useId();
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.lead.listForSearch.queryOptions({
      input: {
        search,
        searchFields: ["name", "email", "phone"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
      },
    })
  );

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
          <SearchableSelector
            value={field.value}
            onChange={field.onChange}
            onSearch={setSearch}
            disabled={disabled}
          >
            <SearchableSelectorTrigger>
              <UserSearch className="size-4" />
              {field.value ? (
                <span className="truncate">
                  {
                    data?.data?.find(({ id }) => id === field.value)?.customer
                      .name
                  }
                </span>
              ) : (
                <span className="text-muted-foreground">Select Lead</span>
              )}
            </SearchableSelectorTrigger>
            <SearchableSelectorContent
              data={data?.data}
              isLoading={isLoading}
              isError={isError}
              error={error}
              title="Select Lead"
              description="Select a lead"
              loadingFallback={
                <SearchableSelectorLoadingSkeleton>
                  <Skeleton className="h-8" />
                </SearchableSelectorLoadingSkeleton>
              }
              emptyFallback={
                <SearchableSelectorEmpty
                  message="No leads found"
                  icon={<UserSearch className="size-8 opacity-20" />}
                />
              }
            >
              {(item) => (
                <SearchableSelectorItem
                  item={item}
                  getItemId={(lead) => lead.id}
                >
                  <span>{item.customer.name}</span>
                  <Status variant={statusVariantMap[item.status] || "default"}>
                    <StatusLabel>{formatEnumValue(item.status)}</StatusLabel>
                  </Status>
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
      )}
    />
  );
}
