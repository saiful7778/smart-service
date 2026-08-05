"use client";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

import { ListLeadCategoriesContractType } from "../../api/leadCategory.contract";
import { LeadCategoryCreateDialog } from "../LeadCategoryCreateDialog";
import { leadCategoryTableColumns } from "./leadCategoryTableColumn";

interface LeadCategoryTableProps {
  data: ListLeadCategoriesContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: FiltersType) => void;
}

export function LeadCategoryTable({
  data,
  filters,
  setFilters,
}: LeadCategoryTableProps) {
  "use no memo";
  const isAllowCreate = usePermissionCheckWithOrg([
    "org.lead_category.manage",
    "org.lead_category.create",
  ]);

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
        {isAllowCreate && <LeadCategoryCreateDialog />}
      </DataTableToolbar>
    </DataTable>
  );
}
