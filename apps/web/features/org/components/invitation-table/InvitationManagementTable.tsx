"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral } from "nuqs";

import { OrgRoleEnumSchema, OrgRoleType } from "@workspace/lib/utils";
import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/DataTableSkeleton";
import { DataTableToolbarSkeleton } from "@workspace/ui/components/data-table/DataTableToolbarSkeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import {
  invitationStatusEnum,
  InvitationStatusEnumType,
} from "../../org.schema";
import { InvitationsTable } from "./InvitationsTable";

export function InvitationManagementTable({
  searchFields,
}: {
  searchFields?: string[] | undefined;
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    additionalKeys: {
      status: parseAsStringLiteral(invitationStatusEnum.options).withOptions({
        clearOnDefault: true,
      }),
      role: parseAsStringLiteral(OrgRoleEnumSchema.options).withOptions({
        clearOnDefault: true,
      }),
    },
  });

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.org.listInvitation.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          status: filters.status ?? undefined,
          role: filters.role ?? undefined,
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
        searchValue={filters.search}
        setSearchValue={globalSearch}
        refresh={refetch}
      />
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data?.data}
        isEmpty={() => false}
        loadingFallback={
          <DataTableSkeleton>
            <DataTableToolbarSkeleton />
          </DataTableSkeleton>
        }
        emptyFallback={<DataTableEmpty />}
      >
        {(data) => (
          <InvitationsTable
            data={data}
            filters={{
              page: filters.page,
              limit: filters.limit,
              search: filters.search,
              order: filters.order,
              orderField: filters.orderField,
              filter: {
                status: filters.status ? [filters.status] : null,
                role: filters.role ? [filters.role] : null,
              },
            }}
            setFilters={(filters) => {
              const roles = filters?.filter?.role as OrgRoleType[] | null;
              const status = filters?.filter?.status as
                InvitationStatusEnumType[] | null;

              setFilters({
                page: filters?.page,
                limit: filters?.limit,
                order: filters?.order ?? null,
                orderField: filters?.orderField ?? null,
                role: roles?.[0] ?? null,
                status: status?.[0] ?? null,
              });
            }}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
