import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import type { ColumnType } from "@workspace/ui/types/data-table";

import { UserAvatar } from "@/components/UserAvatar";

import { ListMemberContractType } from "../../api/org.contract";
import { MemberTableRowAction } from "./MemberTableRowAction";

type MemberTableRowDataType =
  ListMemberContractType["output"]["data"]["data"][number];

export const memberTableColumn: ColumnType<MemberTableRowDataType> = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Full name" />
    ),
    cell: ({ row, getValue }) => (
      <UserAvatar
        userEmail={row.original?.email}
        imageUrl={row.original?.image}
        userName={getValue<MemberTableRowDataType["name"]>()}
        showDetails
      />
    ),
    enableHiding: false,
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "roles",
    accessorKey: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Roles" />
    ),
    cell: ({ getValue }) => {
      const roles = getValue<MemberTableRowDataType["roles"]>();
      return (
        <div className="inline-flex items-center gap-1">
          {roles.map((role, idx) => (
            <Badge variant="secondary" key={idx}>
              {formatEnumValue(role.roleName)}
            </Badge>
          ))}
        </div>
      );
    },
    meta: {
      label: "Roles",
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "action",
    cell: ({ row }) => <MemberTableRowAction memberData={row.original} />,
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
  },
];
