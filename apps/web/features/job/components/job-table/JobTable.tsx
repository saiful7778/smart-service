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

import { ListJobsOutput } from "../../api/job.contract";
import { jobTableColumn } from "./jobTableColumn";

interface JobTableProps {
  data: ListJobsOutput;
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function JobTable({ data, filters, setFilters }: JobTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data.data,
    columns: jobTableColumn,
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
        <Button
          nativeButton={false}
          render={
            <Link href={{ pathname: "/dashboard/organization/jobs/create" }} />
          }
        >
          <CirclePlus />
          <span>Create new job</span>
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
