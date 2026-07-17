"use client";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { ListMemberContractType } from "../../api/org.contract";
import { memberTableColumn } from "./memberTableColumn";

interface MembersTableProps {
  data: ListMemberContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function MembersTable({ data, filters, setFilters }: MembersTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data.data,
    columns: memberTableColumn,
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
