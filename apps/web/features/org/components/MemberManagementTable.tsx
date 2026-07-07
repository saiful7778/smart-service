"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral } from "nuqs";

import { OrgRoleEnumSchema, OrgRoleType } from "@workspace/lib/utils";
import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/data-table-skeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { MembersTable } from "./member-table/MembersTable";

export function MemberManagementTable({
  page,
  limit,
  search,
  searchFields,
}: {
  page: number;
  limit: number;
  search: string;
  searchFields?: string[] | undefined;
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    defaultPage: page,
    defaultLimit: limit,
    defaultSearch: search,
    additionalKeys: {
      roleName: parseAsStringLiteral(OrgRoleEnumSchema.options).withOptions({
        clearOnDefault: true,
      }),
    },
  });

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.org.listMember.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          roleName: filters.roleName ?? undefined,
        },
      },
    })
  );

  const globalSearch = useDebouncedCallback(
    (searchValue: string | null) => setSearchFilter(searchValue),
    500
  );

  return (
    <div className="space-y-3">
      <DataTableGlobalSearch
        searchValue={search}
        setSearchValue={globalSearch}
        refresh={refetch}
      />
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data?.data}
        isEmpty={() => false}
        loadingFallback={<DataTableSkeleton />}
        emptyFallback={<DataTableEmpty />}
      >
        {(data) => (
          <MembersTable
            data={data}
            filters={{
              page: filters.page,
              limit: filters.limit,
              search: filters.search,
              order: filters.order ?? undefined,
              orderField: filters.orderField ?? undefined,
              filter: {
                roleName: filters.roleName,
              },
            }}
            setFilters={(filters) => {
              const roleName = filters?.filter?.roleName as OrgRoleType | null;

              setFilters({
                page: filters?.page ?? DEFAULT_PAGE_INDEX,
                limit: filters?.limit ?? DEFAULT_PAGE_SIZE,
                order: filters?.order ?? null,
                orderField: filters?.orderField ?? null,
                roleName: roleName ?? null,
              });
            }}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
