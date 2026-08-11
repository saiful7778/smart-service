"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { CirclePlus, Trash2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@workspace/ui/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@workspace/ui/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/server/orpc.client";

import { useLeadDeleteAll } from "../../api/lead.api.hook";
import { ListLeadContractType } from "../../api/lead.contract";
import { makeLeadTableColumn } from "./leadTableColumn";

interface LeadTableProps {
  data: ListLeadContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function LeadTable({ data, filters, setFilters }: LeadTableProps) {
  "use no memo";
  const { data: leadCategories } = useSuspenseQuery(
    orpcTQClient.lead.category.listForSearch.queryOptions()
  );
  const isAllowCreate = usePermissionCheckWithOrg([
    "org.lead.manage",
    "org.lead.create",
  ]);

  const columns = useMemo(
    () => makeLeadTableColumn(leadCategories.data),
    [leadCategories.data]
  );

  const table = useDataTable({
    data: data.data,
    columns,
    pageCount: data.meta.pageCount,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search ?? undefined,
      },
    },
  });

  const { mutate: deleteAll, isPending: isDeleting } = useLeadDeleteAll({});

  const handleDeleteAll = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);

    deleteAll({ leadIds: selectedIds });

    table.toggleAllRowsSelected(false);
  }, [table, deleteAll]);

  return (
    <TooltipProvider delay={200}>
      <DataTable
        table={table}
        actionBar={
          <DataTableActionBar table={table}>
            <DataTableActionBarAction
              onClick={handleDeleteAll}
              isPending={isDeleting}
              variant="destructive"
            >
              <Trash2 className="size-4" />
              <span>Delete All</span>
            </DataTableActionBarAction>
            <DataTableActionBarSelection table={table} />
          </DataTableActionBar>
        }
      >
        <DataTableToolbar table={table}>
          {isAllowCreate && (
            <Button
              nativeButton={false}
              render={
                <Link
                  href={{ pathname: "/dashboard/organization/leads/create" }}
                />
              }
            >
              <CirclePlus />
              <span>Create new Lead</span>
            </Button>
          )}
        </DataTableToolbar>
      </DataTable>
    </TooltipProvider>
  );
}
