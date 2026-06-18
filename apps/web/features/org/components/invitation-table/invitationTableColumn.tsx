import { formatDate } from "date-fns";

import { formatEnumValue, OrgRoleEnumSchema } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import type { ColumnType } from "@workspace/ui/types/data-table";

import { UserAvatar } from "@/components/UserAvatar";

import { ListInvitationOutput } from "../../api/org.contract";
import {
  invitationStatusEnum,
  InvitationStatusEnumType,
} from "../../org.schema";
import { InvitationTableRowAction } from "./InvitationTableRowAction";

type InvitationTableRowDataType = ListInvitationOutput["data"][number];

const statusColors: Record<InvitationStatusEnumType, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  accepted:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  canceled: "bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-400",
};

export const invitationTableColumn: ColumnType<InvitationTableRowDataType> = [
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Email" />
    ),
    cell: ({ getValue }) => (
      <span className="text-sm">
        {getValue<InvitationTableRowDataType["email"]>()}
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Role" />
    ),
    cell: ({ getValue }) => (
      <Badge variant="secondary">
        {formatEnumValue(getValue<InvitationTableRowDataType["role"]>())}
      </Badge>
    ),
    meta: {
      label: "Role",
      variant: "select",
      placeholder: "Role",
      options: OrgRoleEnumSchema.options.map((value) => ({
        value,
        label: formatEnumValue(value),
      })),
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Status" />
    ),
    cell: ({ getValue }) => {
      const status = getValue<InvitationTableRowDataType["status"]>();
      return (
        <Badge className={statusColors[status as InvitationStatusEnumType]}>
          {formatEnumValue(status)}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "select",
      placeholder: "Status",
      options: invitationStatusEnum.options.map((value) => ({
        value,
        label: formatEnumValue(value),
      })),
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
  {
    id: "inviter",
    accessorKey: "inviter",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Invited by" />
    ),
    cell: ({ getValue }) => {
      const inviter = getValue<InvitationTableRowDataType["inviter"]>();
      return (
        <UserAvatar
          userEmail={inviter.email}
          userName={inviter.name}
          imageUrl={inviter.image}
          userRoles={inviter.roles}
          showDetails
          showRoleDetails
        />
      );
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Sent at" />
    ),
    cell: ({ getValue }) => (
      <div className="text-muted-foreground">
        {formatDate(
          getValue<InvitationTableRowDataType["createdAt"]>(),
          "PP - p"
        )}
      </div>
    ),
    meta: {
      label: "Sent at",
      variant: "date",
    },
    enableColumnFilter: false,
  },
  {
    id: "action",
    cell: ({ row }) => (
      <InvitationTableRowAction invitationId={row.original.id} />
    ),
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
  },
];
