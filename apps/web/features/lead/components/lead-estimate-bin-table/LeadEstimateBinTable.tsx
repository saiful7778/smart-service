"use client";

import { useCallback } from "react";

import { RotateCcw, Trash2 } from "lucide-react";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@workspace/ui/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import {
  useLeadEstimateBinDeleteAll,
  useLeadEstimateRestoreAll,
} from "@/features/lead/api/leadEstimate.api.hook";
import { ListLeadEstimateBinContractType } from "@/features/lead/api/leadEstimateBin.contract";

import { leadEstimateBinTableColumn } from "./leadEstimateBinTableColumn";

interface LeadEstimateBinTableProps {
  data: ListLeadEstimateBinContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}

export function LeadEstimateBinTable({
  data,
  filters,
  setFilters,
  leadId,
  jobId,
}: LeadEstimateBinTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data.data,
    columns: leadEstimateBinTableColumn,
    pageCount: data.meta.pageCount,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search ?? undefined,
      },
    },
  });

  const { mutate: restoreAll, isPending: isRestoring } =
    useLeadEstimateRestoreAll({});
  const { mutate: deleteAll, isPending: isDeleting } =
    useLeadEstimateBinDeleteAll({});

  const handleRestoreAll = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);

    restoreAll({ leadId, jobId, estimateIds: selectedIds });

    table.toggleAllRowsSelected(false);
  }, [table, restoreAll, leadId, jobId]);

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
            onClick={handleRestoreAll}
            isPending={isRestoring}
          >
            <RotateCcw className="size-4" />
            <span>Restore All</span>
          </DataTableActionBarAction>
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
