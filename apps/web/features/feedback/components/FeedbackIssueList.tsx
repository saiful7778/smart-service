"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { CircleQuestionMark, MessageSquareText, RotateCcw } from "lucide-react";
import { parseAsStringEnum } from "nuqs";

import {
  FeedbackIssueStatusEnumSchema,
  FeedbackIssueStatusEnumType,
  FeedbackIssueTypeEnumSchema,
  FeedbackIssueTypeEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Input } from "@workspace/ui/components/input";
import { RefreshButton } from "@workspace/ui/components/refresh-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { MetaPagination } from "@/components/MetaPagination";
import { FormatDateCell } from "@/components/shared/format-date/FormatDateCell";
import { UserAvatar } from "@/components/UserAvatar";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";
import { RoutePathType } from "@/types";

import { FeedbackStatusBadge, FeedbackTypeBadge } from "./feedback-badges";

export function FeedbackIssueList({
  search,
  searchFields,
  basePath,
}: {
  search: string | null | undefined;
  searchFields?: string[] | null | undefined;
  basePath: "/dashboard/support" | "/dashboard/admin/support";
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    additionalKeys: {
      type: parseAsStringEnum(FeedbackIssueTypeEnumSchema.options).withOptions({
        clearOnDefault: true,
      }),
      status: parseAsStringEnum(
        FeedbackIssueStatusEnumSchema.options
      ).withOptions({
        clearOnDefault: true,
      }),
    },
  });
  const [inputValue, setInputValue] = useState<string>(search ?? "");

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.feedback.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          type: filters.type ?? undefined,
          status: filters.status ?? undefined,
        },
      },
    })
  );

  const globalSearch = useDebouncedCallback(
    (searchValue: string | null) => setSearchFilter(searchValue),
    500
  );

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    globalSearch(value);
    setInputValue(value);
  };

  const handleTypeChange = useCallback(
    (type: FeedbackIssueTypeEnumType | null) => {
      setFilters({ type });
    },
    [setFilters]
  );

  const handleStatusChange = useCallback(
    (status: FeedbackIssueStatusEnumType | null) => {
      setFilters({ status });
    },
    [setFilters]
  );

  const handleReset = useCallback(() => {
    setFilters({
      status: null,
      type: null,
    });
    setSearchFilter(null);
    setInputValue("");
  }, [setFilters, setSearchFilter]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Input
            name="search"
            placeholder="Search issues..."
            className="w-37 lg:w-62"
            value={inputValue}
            onChange={handleOnChange}
          />
          <RefreshButton isLoading={isLoading} onButtonClick={refetch} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            name="types"
            value={filters.type}
            onValueChange={handleTypeChange}
            items={FeedbackIssueTypeEnumSchema.options.map((value) => ({
              value,
              label: formatEnumValue(value),
            }))}
          >
            <SelectTrigger id="issue-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {FeedbackIssueTypeEnumSchema.options.map((value) => (
                <SelectItem key={`type.${value}`} value={value}>
                  {formatEnumValue(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            name="status"
            value={filters.status}
            onValueChange={handleStatusChange}
            items={FeedbackIssueStatusEnumSchema.options.map((value) => ({
              value,
              label: formatEnumValue(value),
            }))}
          >
            <SelectTrigger id="issue-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {FeedbackIssueStatusEnumSchema.options.map((value) => (
                <SelectItem key={`type.${value}`} value={value}>
                  {formatEnumValue(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data?.data}
        isEmpty={(d) => d.data.length === 0}
        emptyFallback={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleQuestionMark />
              </EmptyMedia>
              <EmptyTitle>No issues found</EmptyTitle>
              <EmptyDescription>
                No feedback issues match your filters.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        {({ data, meta }) => (
          <>
            <div className="flex flex-col gap-3">
              {data.map((issue) => (
                <Link
                  key={issue.id}
                  href={`${basePath}/${issue.id}` as RoutePathType}
                  className="group rounded-md border bg-card p-4 shadow transition-colors hover:bg-accent/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <FeedbackTypeBadge type={issue.type} />
                        <FeedbackStatusBadge status={issue.status} />
                        <FormatDateCell
                          className="text-muted-foreground text-sm"
                          format="MMM d, yyyy"
                          value={issue.createdAt}
                        />
                      </div>
                      <h3 className="font-medium group-hover:underline line-clamp-1">
                        {issue.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          userName={issue.createdByUser.name}
                          userEmail={issue.createdByUser.email}
                          imageUrl={issue.createdByUser.image}
                          showDetails
                        />
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MessageSquareText className="size-3.5" />
                          <span className="text-xs">{issue.replyCount}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <MetaPagination
              meta={meta}
              onPageChange={(page) => setFilters({ page })}
            />
          </>
        )}
      </QueryStateBoundary>
    </div>
  );
}
