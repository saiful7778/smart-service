"use client";

import { useCallback } from "react";

import { Trash2 } from "lucide-react";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@workspace/ui/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { useLeadEstimateDeleteAll } from "@/features/lead/api/leadEstimate.api.hook";
import { ListLeadEstimateContractType } from "@/features/lead/api/leadEstimate.contract";

import { estimateTableColumn } from "./estimateTableColumn";

interface EstimateTableProps {
  data: ListLeadEstimateContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}

export function EstimateTable({
  data,
  filters,
  setFilters,
  leadId,
  jobId,
}: EstimateTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data.data,
    columns: estimateTableColumn,
    pageCount: data.meta.pageCount,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search,
      },
    },
  });

  const { mutate: deleteAll, isPending: isDeleting } = useLeadEstimateDeleteAll(
    {}
  );

  const handleDeleteAll = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);

    deleteAll({ leadId, jobId, estimateIds: selectedIds });

    table.toggleAllRowsSelected(false);
  }, [table, deleteAll, leadId, jobId]);

  return (
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
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
