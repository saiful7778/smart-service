import Link from "next/link";

import { formatDate } from "date-fns";

import {
  LeadEstimateStatusEnumSchema,
  LeadEstimateStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { formatCurrency } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import { ColumnType } from "@workspace/ui/types/data-table";

import { ListLeadEstimateContractType } from "@/features/lead/api/leadEstimate.contract";

import { LeadEstimateTableRowAction } from "./LeadEstimateTableRowAction";

type EstimateTableRowDataType =
  ListLeadEstimateContractType["output"]["data"]["data"][number];

const statusColorMap: Record<LeadEstimateStatusEnumType, string> = {
  draft:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  viewed:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  declined: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  expired: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export const leadEstimateTableColumn: ColumnType<EstimateTableRowDataType> = [
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
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Estimate name" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link
          href={{
            pathname: `/dashboard/organization/estimates/${row.original.id}`,
            query: {
              ...(row.original.leadId && {
                leadId: row.original.leadId,
                redirectTo: `/dashboard/organization/leads/${row.original.leadId}`,
              }),
              ...(row.original.jobId && {
                jobId: row.original.jobId,
                redirectTo: `/dashboard/organization/jobs/${row.original.jobId}`,
              }),
            },
          }}
          className="font-medium text-foreground leading-none hover:underline"
        >
          {getValue<EstimateTableRowDataType["name"]>()}
        </Link>
      );
    },
    meta: { label: "Estimate name" },
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Status" />
    ),
    cell: ({ getValue }) => {
      const statusValue = getValue<EstimateTableRowDataType["status"]>();
      return (
        <Badge className={statusColorMap[statusValue]}>
          {formatEnumValue(statusValue)}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "select",
      options: LeadEstimateStatusEnumSchema.options.map((option) => ({
        value: option,
        label: formatEnumValue(option),
      })),
      placeholder: "Select Status",
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
  {
    id: "totalAmount",
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Total Amount" />
    ),
    cell: ({ getValue }) => (
      <div>
        {formatCurrency(
          Number(getValue<EstimateTableRowDataType["totalAmount"]>())
        )}
      </div>
    ),
    meta: { label: "Total Amount", variant: "number" },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Created At" />
    ),
    cell: ({ getValue }) => (
      <div>
        {formatDate(
          getValue<EstimateTableRowDataType["createdAt"]>(),
          "PP - p"
        )}
      </div>
    ),
    meta: { label: "Created At", variant: "date" },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <LeadEstimateTableRowAction estimateData={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
