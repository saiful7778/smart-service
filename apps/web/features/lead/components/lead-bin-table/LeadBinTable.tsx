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
  useLeadBinDeleteAll,
  useLeadRestoreAll,
} from "../../api/lead.api.hook";
import { ListLeadBinContractType } from "../../api/leadBin.contract";
import { leadBinTableColumn } from "./leadBinTableColumn";

interface LeadBinTableProps {
  data: ListLeadBinContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function LeadBinTable({ data, filters, setFilters }: LeadBinTableProps) {
  "use no memo";

  const table = useDataTable({
    data: data.data,
    columns: leadBinTableColumn,
    pageCount: data.meta.pageCount,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search,
      },
    },
  });

  const { mutate: restoreAll, isPending: isRestoring } = useLeadRestoreAll({});
  const { mutate: deleteAll, isPending: isDeleting } = useLeadBinDeleteAll({});

  const handleRestoreAll = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);

    restoreAll({ leadIds: selectedIds });

    table.toggleAllRowsSelected(false);
  }, [table, restoreAll]);

  const handleDeleteAll = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);

    deleteAll({ leadIds: selectedIds });

    table.toggleAllRowsSelected(false);
  }, [table, deleteAll]);

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
