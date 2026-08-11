import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import { ColumnType } from "@workspace/ui/types/data-table";

import { FormatDateCell } from "@/components/shared/format-date/FormatDateCell";
import { UserAvatar } from "@/components/UserAvatar";

import { ListMaterialBinContractType } from "../../api/materialBin.contract";
import { MaterialBinTableRowAction } from "./MaterialBinTableRowAction";

type MaterialBinTableRowDataType =
  ListMaterialBinContractType["output"]["data"]["data"][number];

export const materialBinTableColumn: ColumnType<MaterialBinTableRowDataType> = [
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
      <DataTableColumnHeader column={column} label="Material name" />
    ),
    cell: ({ getValue, row }) => (
      <div>
        <div className="font-medium text-sm text-foreground leading-none hover:underline">
          {getValue<MaterialBinTableRowDataType["name"]>()}
        </div>
        <div className="text-muted-foreground">{row.original.sku}</div>
      </div>
    ),
    meta: { label: "Material name" },
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "unit",
    accessorKey: "unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Unit" />
    ),
    cell: ({ getValue }) => (
      <div>{getValue<MaterialBinTableRowDataType["unit"]>()}</div>
    ),
    meta: { label: "Unit" },
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
        getValue<MaterialBinTableRowDataType["deletedByMember"]>();
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
      label: "Deleted by",
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
      const deletedAt = getValue<MaterialBinTableRowDataType["deletedAt"]>();
      if (!deletedAt) {
        return null;
      }
      return (
        <div className="flex flex-col text-xs">
          <FormatDateCell
            value={deletedAt}
            format="PP"
            className="font-medium"
          />
          <FormatDateCell
            value={deletedAt}
            format="p"
            className="text-muted-foreground"
          />
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
    cell: ({ row }) => (
      <MaterialBinTableRowAction materialData={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
