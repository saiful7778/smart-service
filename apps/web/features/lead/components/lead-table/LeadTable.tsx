"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { CirclePlus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@workspace/ui/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarSelection,
} from "@workspace/ui/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { orpcTQClient } from "@/server/orpc.client";

import { ListLeadOutputs } from "../../api/lead.contract";
import { makeLeadTableColumn } from "./leadTableColumn";

interface LeadTableProps {
  data: ListLeadOutputs;
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function LeadTable({ data, filters, setFilters }: LeadTableProps) {
  "use no memo";
  const { data: leadCategories } = useSuspenseQuery(
    orpcTQClient.lead.category.list.queryOptions()
  );

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
        searchText: filters?.search,
      },
    },
  });

  return (
    <TooltipProvider delay={200}>
      <DataTable
        table={table}
        actionBar={
          <DataTableActionBar table={table}>
            <DataTableActionBarSelection table={table} />
          </DataTableActionBar>
        }
      >
        <DataTableToolbar table={table}>
          <Button
            nativeButton={false}
            size="sm"
            render={
              <Link href={{ pathname: "/dashboard/organization/leads/create" }}>
                <CirclePlus />
                <span>Create new Lead</span>
              </Link>
            }
          />
        </DataTableToolbar>
      </DataTable>
    </TooltipProvider>
  );
}
