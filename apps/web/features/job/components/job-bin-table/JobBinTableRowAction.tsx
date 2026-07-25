import { RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { ListJobBinContractType } from "../../api/jobBin.contract";
import { useJobBinContext } from "./JobBinTableContext";

export function JobBinTableRowAction({
  jobData,
}: {
  jobData: ListJobBinContractType["output"]["data"]["data"][number];
}) {
  const { handleRestoreDialog, handleDeleteDialog } = useJobBinContext();
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={() => handleRestoreDialog(jobData.id)}
              size="icon"
              variant="outline"
            />
          }
        >
          <RotateCcw />
          <span className="sr-only">restore job</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Restore job</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={() => handleDeleteDialog(jobData.id)}
              size="icon"
              variant="destructive"
            />
          }
        >
          <Trash2 />
          <span className="sr-only">delete job permanently</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete job</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
