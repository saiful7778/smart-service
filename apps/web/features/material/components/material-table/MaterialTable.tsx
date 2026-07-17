"use client";

import Link from "next/link";

import { CirclePlus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@workspace/ui/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarSelection,
} from "@workspace/ui/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

import { ListMaterialOutput } from "../../api/material.contract";
import { materialTableColumn } from "./materialTableColumn";

interface MaterialTableProps {
  data: ListMaterialOutput;
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

  return (
    <DataTable
      table={table}
      actionBar={
        <DataTableActionBar table={table}>
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
            <span>Create Material</span>
          </Button>
        )}
      </DataTableToolbar>
    </DataTable>
  );
}
