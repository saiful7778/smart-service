import { RotateCcw, Trash2 } from "lucide-react";

import DataTableRowMenu from "@workspace/ui/components/data-table/data-table-row-menu";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu";

import { ListLeadBinOutputs } from "../../api/lead.contract";
import { useLeadBinContext } from "./LeadBinTableContext";

export function LeadBinTableRowAction({
  leadData,
}: {
  leadData: ListLeadBinOutputs["data"][number];
}) {
  const { handleRestoreDialog, handleDeleteDialog } = useLeadBinContext();
  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleRestoreDialog(leadData.id)}>
            <RotateCcw className="size-4" />
            <span>Restore</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDeleteDialog(leadData.id)}
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
