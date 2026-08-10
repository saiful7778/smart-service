import Link from "next/link";

import { formatDate } from "date-fns";

import { LeadEstimateStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { formatCurrency } from "@workspace/lib/utils";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import { ColumnType } from "@workspace/ui/types/data-table";

import { ListLeadEstimateContractType } from "@/features/lead/api/leadEstimate.contract";

import { EstimateStatusBadge } from "../EstimateStatusBadge";
import { LeadEstimateTableRowAction } from "./LeadEstimateTableRowAction";

type EstimateTableRowDataType =
  ListLeadEstimateContractType["output"]["data"]["data"][number];

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
            query: row.original.leadId
              ? {
                  leadId: row.original.leadId,
                  redirectTo: `/dashboard/organization/leads/${row.original.leadId}?tab=estimates`,
                }
              : row.original.jobId
                ? {
                    jobId: row.original.jobId,
                    redirectTo: `/dashboard/organization/leads/${row.original.jobId}?tab=estimates`,
                  }
                : undefined,
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
      return (
        <EstimateStatusBadge
          status={getValue<EstimateTableRowDataType["status"]>()}
        />
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
