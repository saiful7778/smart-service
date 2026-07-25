"use client";

import Link from "next/link";
import { useCallback } from "react";

import { CirclePlus, Trash2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@workspace/ui/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@workspace/ui/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

import { useMaterialDeleteAll } from "../../api/material.api.hook";
import { ListMaterialContractType } from "../../api/material.contract";
import { materialTableColumn } from "./materialTableColumn";

interface MaterialTableProps {
  data: ListMaterialContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function MaterialTable({
  data,
  filters,
  setFilters,
}: MaterialTableProps) {
  "use no memo";
  const isAllowCreate = usePermissionCheckWithOrg([
    "org.material.manage",
    "org.material.create",
  ]);

  const table = useDataTable({
    data: data.data,
    columns: materialTableColumn,
    pageCount: data.meta.pageCount,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search,
      },
    },
  });

  const { mutate: deleteAll, isPending: isDeleting } = useMaterialDeleteAll({});

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
                href={{ pathname: "/dashboard/organization/materials/create" }}
              />
            }
          >
            <CirclePlus />
            <span>Create material</span>
          </Button>
        )}
      </DataTableToolbar>
    </DataTable>
  );
}
