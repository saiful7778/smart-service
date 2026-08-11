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

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

import {
  useMaterialBinDeleteAll,
  useMaterialRestoreAll,
} from "../../api/material.api.hook";
import { ListMaterialBinContractType } from "../../api/materialBin.contract";
import { materialBinTableColumn } from "./materialBinTableColumn";

interface MaterialBinTableProps {
  data: ListMaterialBinContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function MaterialBinTable({
  data,
  filters,
  setFilters,
}: MaterialBinTableProps) {
  "use no memo";
  const user = useAuthStore((state) => state.user!);

  const table = useDataTable({
    data: data.data,
    columns: materialBinTableColumn,
    pageCount: data.meta.pageCount,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search ?? undefined,
      },
    },
  });

  const { mutate: restoreAll, isPending: isRestoring } = useMaterialRestoreAll(
    {}
  );
  const { mutate: deleteAll, isPending: isDeleting } = useMaterialBinDeleteAll(
    {}
  );

  const handleRestoreAll = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);

    restoreAll({ materialIds: selectedIds });

    table.toggleAllRowsSelected(false);
  }, [table, restoreAll]);

  const handleDeleteAll = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);

    deleteAll({ materialIds: selectedIds });

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
      <DataTableToolbar table={table} timezone={user?.timezone} />
    </DataTable>
  );
}
