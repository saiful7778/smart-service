"use client";

import { useMemo } from "react";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { ListOrgRoleContractType } from "../../api/role.contract";
import { CreateOrgRoleDialog } from "../CreateOrgRoleDialog";
import { orgRoleTableColumn } from "./orgRoleTableColumn";

interface OrgRoleTableProps {
  data: ListOrgRoleContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function OrgRoleTable({ data, filters, setFilters }: OrgRoleTableProps) {
  "use no memo";
  const columns = useMemo(() => orgRoleTableColumn, []);

  const table = useDataTable({
    data: data,
    columns,
    pageCount: 1,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search ?? undefined,
      },
    },
  });

  return (
    <DataTable table={table} showPagination={false}>
      <DataTableToolbar table={table}>
        <CreateOrgRoleDialog />
      </DataTableToolbar>
    </DataTable>
  );
}
