"use client";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { ListLeadCategoriesOutput } from "../../api/leadCategory.contract";
import { LeadCategoryCreateDialog } from "../LeadCategoryCreateDialog";
import { leadCategoryTableColumns } from "./leadCategoryTableColumn";

interface LeadCategoryTableProps {
  data: ListLeadCategoriesOutput;
  filters: FiltersType;
  setFilters: (filters: FiltersType) => void;
}

export function LeadCategoryTable({
  data,
  filters,
  setFilters,
}: LeadCategoryTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data,
    columns: leadCategoryTableColumns,
    pageCount: 1,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search,
      },
    },
  });

  return (
    <DataTable table={table} showPagination={false}>
      <DataTableToolbar table={table}>
        <LeadCategoryCreateDialog />
      </DataTableToolbar>
    </DataTable>
  );
}
