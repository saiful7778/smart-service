import { formatDate } from "date-fns";

import { formatEnumValue } from "@workspace/lib/utils";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import {
  Status,
  StatusIndicator,
  StatusLabel,
  StatusVariant,
} from "@workspace/ui/components/status";
import { ColumnType } from "@workspace/ui/types/data-table";

import { UserAvatar } from "@/components/UserAvatar";

import { ListJobBinContractType } from "../../api/jobBin.contract";
import { JobBinTableRowAction } from "./JobBinTableRowAction";

type JobBinTableRowDataType =
  ListJobBinContractType["output"]["data"]["data"][number];

const statusVariantMap: Record<
  JobBinTableRowDataType["status"],
  StatusVariant
> = {
  draft: "default",
  scheduled: "info",
  in_progress: "info",
  on_hold: "warning",
  needs_review: "warning",
  completed: "success",
  cancelled: "error",
};

export const jobBinTableColumn: ColumnType<JobBinTableRowDataType> = [
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
    cell: ({ getValue }) => (
      <div className="font-medium text-foreground leading-none">
        {getValue<JobBinTableRowDataType["title"]>()}
      </div>
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
    cell: ({ getValue }) => {
      const status = getValue<JobBinTableRowDataType["status"]>();
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
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "deletedByMember",
    accessorKey: "deletedByMember",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Deleted by" />
    ),
    cell: ({ getValue }) => {
      const deletedByMember =
        getValue<JobBinTableRowDataType["deletedByMember"]>();
      return (
        <UserAvatar
          userName={deletedByMember.name}
          userEmail={deletedByMember.email}
          userRoles={deletedByMember.roles}
          imageUrl={deletedByMember.image}
          showDetails
          showRoleDetails
        />
      );
    },
    meta: {
      label: "Status",
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "deletedAt",
    accessorKey: "deletedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Deleted at" />
    ),
    cell: ({ getValue }) => {
      const deletedAt = getValue<JobBinTableRowDataType["deletedAt"]>();
      if (!deletedAt) {
        return null;
      }
      return (
        <div className="flex flex-col text-xs">
          <span className="font-medium">{formatDate(deletedAt, "PP")}</span>
          <span className="text-muted-foreground">
            {formatDate(deletedAt, "p")}
          </span>
        </div>
      );
    },
    meta: {
      label: "Deleted at",
      variant: "dateRange",
      placeholder: "Select deleted at",
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <JobBinTableRowAction jobData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
