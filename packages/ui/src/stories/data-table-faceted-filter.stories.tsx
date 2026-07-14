import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Column, ColumnFiltersState } from "@tanstack/react-table";

import { DataTableFacetedFilter } from "@workspace/ui/components/data-table/data-table-faceted-filter";
import type { Option } from "@workspace/ui/types/data-table.js";

const options: Option[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending", count: 10 },
  { label: "Suspended", value: "suspended", count: 2 },
];

const meta = {
  title: "DataTable/faceted-filter",
  component: DataTableFacetedFilter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataTableFacetedFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options,
    placeholder: "Status",
    isMultiple: true,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [filterValue, setFilterValue] = React.useState<ColumnFiltersState>(
      []
    );

    // Mock Column object
    const mockColumn = {
      getFilterValue: () => filterValue,
      setFilterValue: (value: ColumnFiltersState) => {
        setFilterValue(value);
      },
    } as Column<unknown>;

    return <DataTableFacetedFilter {...args} column={mockColumn} />;
  },
};
