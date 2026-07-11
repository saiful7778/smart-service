import { RotateCcw, Trash2 } from "lucide-react";

import DataTableRowMenu from "@workspace/ui/components/data-table/data-table-row-menu";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu";

import { ListJobBinOutputs } from "../../api/jobBin.contract";
import { useJobBinContext } from "./JobBinTableContext";

export function JobBinTableRowAction({
  jobData,
}: {
  jobData: ListJobBinOutputs["data"][number];
}) {
  const { handleRestoreDialog, handleDeleteDialog } = useJobBinContext();
  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleRestoreDialog(jobData.id)}>
            <RotateCcw className="size-4" />
            <span>Restore</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDeleteDialog(jobData.id)}
            variant="destructive"
          >
            <Trash2 className="size-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DataTableRowMenu>
    </>
  );
}
