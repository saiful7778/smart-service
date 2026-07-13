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

import { ListLeadBinOutputs } from "../../api/leadBin.contract";
import { LeadBinTableRowAction } from "./LeadBinTableRowAction";

type LeadBinTableRowDataType = ListLeadBinOutputs["data"][number];

const statusVariantMap: Record<
  LeadBinTableRowDataType["status"],
  StatusVariant
> = {
  new: "default",
  contacted: "info",
  qualified: "success",
  nurture: "warning",
  converted: "success",
  lost: "error",
  cancelled: "error",
  disqualified: "error",
};

export const leadBinTableColumn: ColumnType<LeadBinTableRowDataType> = [
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
    size: 40,
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
          <div className="font-medium text-foreground leading-none">
            {row.original.customer.name}
          </div>
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
      const status = getValue<LeadBinTableRowDataType["status"]>();
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
        getValue<LeadBinTableRowDataType["deletedByMember"]>();
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
      const deletedAt = getValue<LeadBinTableRowDataType["deletedAt"]>();
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
    cell: ({ row }) => <LeadBinTableRowAction leadData={row.original} />,
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
];
