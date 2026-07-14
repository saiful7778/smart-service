import Link from "next/link";

import { formatDate } from "date-fns";

import { LeadStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import {
  Status,
  StatusIndicator,
  StatusLabel,
  type StatusVariant,
} from "@workspace/ui/components/status";
import type { ColumnType } from "@workspace/ui/types/data-table";

import TruncatedList from "@/components/TruncatedList";

import { ListLeadOutputs } from "../../api/lead.contract";
import { ListLeadCategoriesForSearchOutput } from "../../api/leadCategory.contract";
import { LeadTableRowAction } from "./LeadTableRowAction";

type LeadTableRowDataType = ListLeadOutputs["data"][number];

const statusVariantMap: Record<LeadTableRowDataType["status"], StatusVariant> =
  {
    new: "default",
    contacted: "info",
    qualified: "success",
    nurture: "warning",
    converted: "success",
    lost: "error",
    cancelled: "error",
    disqualified: "error",
  };

export function makeLeadTableColumn(
  leadCategories: ListLeadCategoriesForSearchOutput
): ColumnType<LeadTableRowDataType> {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            !!table.getIsSomePageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "leadInfo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Lead info" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/dashboard/organization/leads/${row.original.id}`}
              className="font-medium text-foreground leading-none hover:underline"
            >
              {row.original.customer.name}
            </Link>
            <div className="flex flex-col text-muted-foreground text-xs leading-tight">
              {row.original.customer.email && (
                <span>{row.original.customer.email}</span>
              )}
              {row.original.customer.phone && (
                <span>{row.original.customer.phone}</span>
              )}
            </div>
          </div>
        );
      },
      meta: { label: "Lead info" },
      enableColumnFilter: false,
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Status" />
      ),
      cell: ({ getValue }) => {
        const status = getValue<LeadTableRowDataType["status"]>();
        const variant = statusVariantMap[status] || "default";
        return (
          <Status variant={variant}>
            <StatusIndicator />
            <StatusLabel>{formatEnumValue(status)}</StatusLabel>
          </Status>
        );
      },
      meta: {
        label: "Status",
        variant: "select",
        options: LeadStatusEnumSchema.options.map((option) => ({
          value: option,
          label: formatEnumValue(option),
        })),
        placeholder: "Select status",
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: "leadCategories",
      accessorKey: "leadCategories",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Categories" />
      ),
      cell: ({ getValue }) => {
        const leadCategories =
          getValue<LeadTableRowDataType["leadCategories"]>();

        return (
          <TruncatedList
            items={leadCategories}
            limit={2}
            emptyText="Not specified"
            popoverTitle="All Categories"
          />
        );
      },
      meta: {
        label: "Categories",
        variant: "multiSelect",
        placeholder: "Select categories",
        options: leadCategories.map((leadCategory) => ({
          value: leadCategory.slug,
          label: leadCategory.name,
          count: leadCategory.totalLeads,
        })),
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: "totalJobs",
      accessorKey: "totalJobs",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Total Jobs" />
      ),
      cell: ({ getValue, row }) => (
        <Link
          href={{
            pathname: `/dashboard/organization/leads/${row.original.id}`,
            search: "tab=jobs",
          }}
          className="font-medium group inline-flex items-center gap-1"
        >
          <span>{getValue<LeadTableRowDataType["totalJobs"]>()}</span>
          <span className="text-accent group-hover:underline">view all</span>
        </Link>
      ),
      meta: {
        label: "Total jobs",
      },
      enableSorting: false,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Registered at" />
      ),
      cell: ({ getValue }) => {
        const createdAt = getValue<LeadTableRowDataType["createdAt"]>();
        if (!createdAt) {
          return (
            <span className="text-muted-foreground text-xs italic">
              Not booked
            </span>
          );
        }
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium">{formatDate(createdAt, "PP")}</span>
            <span className="text-muted-foreground">
              {formatDate(createdAt, "p")}
            </span>
          </div>
        );
      },
      meta: {
        label: "Registered at",
        variant: "dateRange",
        placeholder: "Select registered at",
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => <LeadTableRowAction leadData={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
