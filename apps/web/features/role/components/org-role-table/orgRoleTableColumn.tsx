import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import type { ColumnType } from "@workspace/ui/types/data-table";

import { FormatDateCell } from "@/components/shared/format-date/FormatDateCell";

import { ListOrgRoleContractType } from "../../api/role.contract";
import { PermissionsCell } from "../role-table/PermissionsCell";
import { OrgRoleTableRowAction } from "./OrgRoleTableRowAction";

type RoleTableRowDataType = ListOrgRoleContractType["output"]["data"][number];

export const orgRoleTableColumn: ColumnType<RoleTableRowDataType> = [
  {
    id: "roleName",
    accessorKey: "roleName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Role name" />
    ),
    cell: ({ getValue, row }) => (
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {formatEnumValue(getValue<RoleTableRowDataType["roleName"]>())}
          </span>
          {row.original.type === "dynamic" && (
            <Badge variant="secondary">Custom</Badge>
          )}
        </div>
        {row.original.type === "dynamic" && (
          <div className="text-muted-foreground">
            <FormatDateCell value={row.original.createdAt} format="P - p" />
          </div>
        )}
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
