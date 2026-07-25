import { RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { ListLeadBinContractType } from "../../api/leadBin.contract";
import { useLeadBinContext } from "./LeadBinTableContext";

export function LeadBinTableRowAction({
  leadData,
}: {
  leadData: ListLeadBinContractType["output"]["data"]["data"][number];
}) {
  const { handleRestoreDialog, handleDeleteDialog } = useLeadBinContext();
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={() => handleRestoreDialog(leadData.id)}
              size="icon"
              variant="outline"
            />
          }
        >
          <RotateCcw />
          <span className="sr-only">restore lead</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Restore lead</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={() => handleDeleteDialog(leadData.id)}
              size="icon"
              variant="destructive"
            />
          }
        >
          <Trash2 />
          <span className="sr-only">delete lead permanently</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete lead</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
