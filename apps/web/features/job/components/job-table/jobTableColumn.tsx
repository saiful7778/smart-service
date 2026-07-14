import Link from "next/link";

import { formatDate } from "date-fns";

import { JobStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import {
  Status,
  StatusIndicator,
  StatusLabel,
  StatusVariant,
} from "@workspace/ui/components/status";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { ColumnType } from "@workspace/ui/types/data-table";

import { formatCurrency } from "@/utils/formatCurrency";

import { ListJobsOutput } from "../../api/job.contract";
import { JobTableRowAction } from "./JobTableRowAction";

type JobTableRowDataType = ListJobsOutput["data"][number];

const statusVariantMap: Record<JobTableRowDataType["status"], StatusVariant> = {
  draft: "default",
  scheduled: "info",
  in_progress: "info",
  on_hold: "warning",
  needs_review: "warning",
  completed: "success",
  cancelled: "error",
};

export const jobTableColumn: ColumnType<JobTableRowDataType> = [
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
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Job name" />
    ),
    cell: ({ row, getValue }) => (
      <Link
        href={{ pathname: `/dashboard/organization/jobs/${row.original.id}` }}
        className="font-medium text-foreground leading-none hover:underline"
      >
        {getValue<JobTableRowDataType["title"]>()}
      </Link>
    ),
    meta: { label: "Job name" },
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
      const status = getValue<JobTableRowDataType["status"]>();
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
      options: JobStatusEnumSchema.options.map((option) => ({
        value: option,
        label: formatEnumValue(option),
      })),
      placeholder: "Select status",
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
  {
    id: "receivedRevenue",
    accessorKey: "receivedRevenue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Revenue" />
    ),
    cell: ({ getValue }) => {
      const revenue = getValue<JobTableRowDataType["receivedRevenue"]>();

      return (
        <Tooltip>
          <TooltipTrigger>
            <span className="font-medium">
              {formatCurrency(Number(revenue || 0))}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is received revenue</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: {
      label: "Revenue",
      variant: "range",
      range: [0, 5000],
      placeholder: "Select revenue",
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "serviceAt",
    accessorKey: "serviceAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Service At" />
    ),
    cell: ({ getValue }) => {
      const serviceAt = getValue<JobTableRowDataType["serviceAt"]>();
      if (!serviceAt) {
        return (
          <span className="text-muted-foreground text-xs italic">
            Not scheduled
          </span>
        );
      }
      return (
        <div className="flex flex-col text-xs">
          <span className="font-medium">{formatDate(serviceAt, "PP")}</span>
          <span className="text-muted-foreground">
            {formatDate(serviceAt, "p")}
          </span>
        </div>
      );
    },
    meta: {
      label: "Service At",
      variant: "dateRange",
      placeholder: "Select service at",
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <JobTableRowAction jobData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
