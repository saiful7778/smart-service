"use client";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { ListUserOutput } from "../../api/user.contract";
import { userTableColumn } from "./userTableColumn";

interface UsersTableProps {
  data: ListUserOutput;
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function UsersTable({ data, filters, setFilters }: UsersTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data.data,
    columns: userTableColumn,
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
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
