import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Column, ColumnFiltersState } from "@tanstack/react-table";

import { DataTableSliderFilter } from "@workspace/ui/components/data-table/data-table-slider-filter";

const meta = {
  title: "DataTable/slider-filter",
  component: DataTableSliderFilter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataTableSliderFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Price Filter",
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [filterValue, setFilterValue] = React.useState<ColumnFiltersState>(
      []
    );

    // Mock Column object
    const mockColumn = {
      id: "price",
      columnDef: {
        meta: {
          unit: "$",
          range: [0, 1000],
        },
      },
      getFilterValue: () => filterValue,
      setFilterValue: (value: ColumnFiltersState) => setFilterValue(value),
      getFacetedMinMaxValues: () => [0, 1000],
    } as Column<ColumnFiltersState>;

    return <DataTableSliderFilter {...args} column={mockColumn} />;
  },
};
