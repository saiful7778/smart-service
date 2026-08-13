import Link from "next/link";

import { User } from "lucide-react";

import { JobStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { formatCurrency } from "@workspace/lib/utils";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { ColumnType } from "@workspace/ui/types/data-table";

import { FormatDateCell } from "@/components/shared/format-date/FormatDateCell";

import { ListJobsContractType } from "../../api/job.contract";
import { JobStatusBadge } from "../JobStatusBadge";
import { JobTableRowAction } from "./JobTableRowAction";

type JobTableRowDataType =
  ListJobsContractType["output"]["data"]["data"][number];

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
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Status" />
    ),
    cell: ({ getValue }) => (
      <JobStatusBadge status={getValue<JobTableRowDataType["status"]>()} />
    ),
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
    id: "assignedCount",
    accessorKey: "assignedCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Assigned user" />
    ),
    cell: ({ getValue, row }) => {
      const assignedCount = getValue<JobTableRowDataType["assignedCount"]>();

      return (
        <Link
          className="group/link flex items-center gap-2 hover:text-accent"
          href={{
            pathname: `/dashboard/organization/jobs/${row.original.id}`,
            query: {
              tab: "assignments",
            },
          }}
        >
          <User className="size-3" />
          <span className="group-hover/link:underline group-hover/link:text-accent">
            {`${assignedCount} view all`}
          </span>
        </Link>
      );
    },
    meta: {
      label: "Assigned user",
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "schedule",
    accessorKey: "schedule",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Scheduled at" />
    ),
    cell: ({ getValue }) => {
      const schedules = getValue<JobTableRowDataType["schedule"]>();
      if (schedules.length === 0) {
        return (
          <span className="text-muted-foreground text-xs italic">
            Not scheduled
          </span>
        );
      }
      return (
        <div className="flex flex-col gap-2">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex flex-col gap-1">
              <div className="flex gap-1 items-center">
                <span className="font-medium text-muted-foreground">
                  Start at
                </span>
                <span className="font-medium text-muted-foreground">:</span>
                <FormatDateCell value={schedule.startAt} format="PP - p" />
              </div>
              <div className="flex gap-1 items-center">
                <span className="font-medium text-muted-foreground">
                  End at
                </span>
                <span className="font-medium text-muted-foreground">:</span>
                <FormatDateCell value={schedule.endAt} format="PP - p" />
              </div>
            </div>
          ))}
        </div>
      );
    },
    meta: {
      label: "Scheduled At",
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <JobTableRowAction jobData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
