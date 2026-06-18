import { formatEnumValue } from "@workspace/lib/utils";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import type { ColumnType } from "@workspace/ui/types/data-table";

import { ListOrgRoleOutput } from "../../api/role.contract";
import { PermissionsCell } from "../role-table/PermissionsCell";
import { OrgRoleTableRowAction } from "./OrgRoleTableRowAction";

type RoleTableRowDataType = ListOrgRoleOutput[number];

export const orgRoleTableColumn: ColumnType<RoleTableRowDataType> = [
  {
    id: "roleName",
    accessorKey: "roleName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Role name" />
    ),
    cell: ({ getValue, row }) =>
      row.original.customRoleName ? (
        <div>
          <div className="text-sm font-semibold">
            {row.original.customRoleName}
          </div>
          <div className="text-muted-foreground">
            {`Access level: ${formatEnumValue(getValue<RoleTableRowDataType["roleName"]>())}`}
          </div>
        </div>
      ) : (
        <div className="text-sm font-semibold">
          {formatEnumValue(getValue<RoleTableRowDataType["roleName"]>())}
        </div>
      ),
    enableHiding: false,
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "description",
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Description" />
    ),
    cell: ({ getValue }) => (
      <div>{getValue<RoleTableRowDataType["description"]>()}</div>
    ),
    meta: {
      label: "Description",
    },
    enableSorting: false,
  },
  {
    id: "permissions",
    accessorKey: "permissions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Permissions" />
    ),
    cell: ({ getValue }) => (
      <PermissionsCell
        permissions={getValue<RoleTableRowDataType["permissions"]>()}
      />
    ),
    meta: {
      label: "Permissions",
    },
    enableHiding: false,
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "action",
    cell: ({ row }) => <OrgRoleTableRowAction roleData={row.original} />,
    enableHiding: false,
    enableColumnFilter: false,
    enableSorting: false,
  },
];
