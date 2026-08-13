"use client";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

import { ListInvitationContractType } from "../../api/org.contract";
import { InviteMemberDialog } from "../InviteMemberDialog";
import { invitationTableColumn } from "./invitationTableColumn";

interface InvitationsTableProps {
  data: ListInvitationContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function InvitationsTable({
  data,
  filters,
  setFilters,
}: InvitationsTableProps) {
  "use no memo";
  const user = useAuthStore((state) => state.user!);
  const table = useDataTable({
    data: data.data,
    columns: invitationTableColumn,
    pageCount: data.meta.pageCount,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search ?? undefined,
      },
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} timezone={user?.timezone}>
        <InviteMemberDialog />
      </DataTableToolbar>
    </DataTable>
  );
}
