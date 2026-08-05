import Link from "next/link";

import { formatCurrency } from "@workspace/lib/utils";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import { ColumnType } from "@workspace/ui/types/data-table";

import { ListMaterialContractType } from "../../api/material.contract";
import { MaterialTableRowAction } from "./MaterialTableRowAction";

type MaterialTableRowDataType =
  ListMaterialContractType["output"]["data"]["data"][number];

export const materialTableColumn: ColumnType<MaterialTableRowDataType> = [
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
    cell: ({ row, getValue }) => (
      <div>
        <Link
          href={{
            pathname: `/dashboard/organization/materials/${row.original.id}`,
          }}
          className="font-medium text-sm text-foreground leading-none hover:underline"
        >
          {getValue<MaterialTableRowDataType["name"]>()}
        </Link>
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
      <div>{getValue<MaterialTableRowDataType["unit"]>()}</div>
    ),
    meta: { label: "Unit" },
    enableSorting: false,
  },
  {
    id: "unitPrice",
    accessorKey: "unitPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Unit Price" />
    ),
    cell: ({ getValue }) => (
      <div>
        {formatCurrency(
          Number(getValue<MaterialTableRowDataType["unitPrice"]>())
        )}
      </div>
    ),
    meta: { label: "Unit Price", variant: "number" },
    enableSorting: true,
  },
  {
    id: "costPrice",
    accessorKey: "costPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Cost Price" />
    ),
    cell: ({ getValue }) => (
      <div>
        {formatCurrency(
          Number(getValue<MaterialTableRowDataType["costPrice"]>())
        )}
      </div>
    ),
    meta: { label: "Cost Price", variant: "number" },
    enableSorting: true,
  },
  {
    id: "stockQuantity",
    accessorKey: "stockQuantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Stock Quantity" />
    ),
    cell: ({ getValue }) => (
      <div>{getValue<MaterialTableRowDataType["stockQuantity"]>()}</div>
    ),
    meta: { label: "Stock Quantity", variant: "number" },
    enableSorting: true,
  },
  {
    id: "minimumStockLevel",
    accessorKey: "minimumStockLevel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Minimum stock level" />
    ),
    cell: ({ getValue }) => (
      <div>{getValue<MaterialTableRowDataType["minimumStockLevel"]>()}</div>
    ),
    meta: { label: "Minimum stock level", variant: "number" },
    enableSorting: true,
  },
  {
    id: "action",
    cell: ({ row }) => <MaterialTableRowAction materialData={row.original} />,
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
  },
];
