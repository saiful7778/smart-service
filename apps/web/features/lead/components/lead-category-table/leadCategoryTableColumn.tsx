import Link from "next/link";

import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import type { ColumnType } from "@workspace/ui/types/data-table";

import { FormatDateCell } from "@/components/shared/format-date/FormatDateCell";
import { UserAvatar } from "@/components/UserAvatar";

import { ListLeadCategoriesContractType } from "../../api/leadCategory.contract";
import { LeadCategoryTableRowAction } from "./LeadCategoryTableRowAction";

type LeadCategoryTableRowDataType =
  ListLeadCategoriesContractType["output"]["data"][number];

export const leadCategoryTableColumns: ColumnType<LeadCategoryTableRowDataType> =
  [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Name" />
      ),
      cell: ({ getValue, row }) => (
        <div className="leading-none">
          <div className="font-semibold">
            {getValue<LeadCategoryTableRowDataType["name"]>()}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.slug}
          </div>
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
        <p className="whitespace-normal">
          {getValue<LeadCategoryTableRowDataType["description"]>() || "-"}
        </p>
      ),
      meta: { label: "Description" },
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      id: "totalLeads",
      accessorKey: "totalLeads",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Total Leads" />
      ),
      cell: ({ getValue, row }) => (
        <Link
          href={{
            pathname: "/dashboard/organization/leads",
            search: `categories=${row.original.slug}`,
          }}
          className="flex items-center gap-1"
        >
          <span>
            {getValue<
              LeadCategoryTableRowDataType["totalLeads"]
            >().toLocaleString("en-US")}
          </span>
          <span className="text-primary underline">view all</span>
        </Link>
      ),
      meta: { label: "Total Leads" },
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      id: "createdBy",
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Created By" />
      ),
      cell: ({ getValue }) => {
        const createdBy = getValue<LeadCategoryTableRowDataType["createdBy"]>();
        return (
          <UserAvatar
            userName={createdBy.name}
            userEmail={createdBy.email}
            imageUrl={createdBy.image}
            userRoles={createdBy.roles}
            showDetails
            showRoleDetails
          />
        );
      },
      meta: { label: "Created By" },
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Created At" />
      ),
      cell: ({ getValue }) => (
        <div className="flex flex-col text-xs">
          <FormatDateCell
            value={getValue<LeadCategoryTableRowDataType["createdAt"]>()}
            format="PP"
            className="font-medium"
          />
          <FormatDateCell
            value={getValue<LeadCategoryTableRowDataType["createdAt"]>()}
            format="p"
            className="text-muted-foreground"
          />
        </div>
      ),
      meta: { label: "Created At" },
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      id: "action",
      cell: ({ row }) => <LeadCategoryTableRowAction category={row.original} />,
      enableColumnFilter: false,
      enableSorting: false,
      enableHiding: false,
    },
  ];
