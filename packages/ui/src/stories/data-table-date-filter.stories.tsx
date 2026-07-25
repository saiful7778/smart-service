import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Column, ColumnFiltersState } from "@tanstack/react-table";

import { DataTableDateFilter } from "@workspace/ui/components/data-table/data-table-date-filter";

const meta = {
  title: "DataTable/date-filter",
  component: DataTableDateFilter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataTableDateFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Date Filter",
    isInRange: false,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [filterValue, setFilterValue] = React.useState<ColumnFiltersState>(
      []
    );

    // Mock Column object
    const mockColumn = {
      getFilterValue: () => filterValue,
      setFilterValue: (value: ColumnFiltersState) => setFilterValue(value),
    } as Column<ColumnFiltersState>;

    return <DataTableDateFilter {...args} column={mockColumn} />;
  },
};

export const Range: Story = {
  args: {
    placeholder: "Range Filter",
    isInRange: true,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [filterValue, setFilterValue] = React.useState<ColumnFiltersState>(
      []
    );

    // Mock Column object
    const mockColumn = {
      getFilterValue: () => filterValue,
      setFilterValue: (value: ColumnFiltersState) => setFilterValue(value),
    } as Column<ColumnFiltersState>;

    return <DataTableDateFilter {...args} column={mockColumn} />;
  },
};
