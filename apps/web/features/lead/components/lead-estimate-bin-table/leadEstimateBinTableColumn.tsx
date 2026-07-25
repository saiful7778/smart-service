import { formatDate } from "date-fns";

import {
  LeadEstimateStatusEnumSchema,
  LeadEstimateStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import { ColumnType } from "@workspace/ui/types/data-table";

import { ListLeadEstimateBinContractType } from "@/features/lead/api/leadEstimateBin.contract";
import { formatCurrency } from "@/utils/formatCurrency";

import { LeadEstimateBinTableRowAction } from "./LeadEstimateBinTableRowAction";

type EstimateBinTableRowDataType =
  ListLeadEstimateBinContractType["output"]["data"]["data"][number];

const statusColorMap: Record<LeadEstimateStatusEnumType, string> = {
  draft:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  viewed:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  declined: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  expired: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  converted:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export const leadEstimateBinTableColumn: ColumnType<EstimateBinTableRowDataType> =
  [
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
      cell: ({ getValue }) => (
        <div>{getValue<EstimateBinTableRowDataType["name"]>()}</div>
      ),
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
        const statusValue = getValue<EstimateBinTableRowDataType["status"]>();
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
            Number(getValue<EstimateBinTableRowDataType["totalAmount"]>())
          )}
        </div>
      ),
      meta: { label: "Total Amount", variant: "number" },
    },
    {
      id: "deletedAt",
      accessorKey: "deletedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Deleted At" />
      ),
      cell: ({ getValue }) => {
        const deletedAt = getValue<EstimateBinTableRowDataType["deletedAt"]>();
        return <div>{deletedAt ? formatDate(deletedAt, "PP - p") : "N/A"}</div>;
      },
      meta: { label: "Deleted At", variant: "date" },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <LeadEstimateBinTableRowAction estimateData={row.original} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
