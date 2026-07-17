import { RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { ListMaterialBinContractType } from "../../api/materialBin.contract";
import { useMaterialBinContext } from "./MaterialBinTableContext";

export function MaterialBinTableRowAction({
  materialData,
}: {
  materialData: ListMaterialBinContractType["output"]["data"]["data"][number];
}) {
  const { handleRestoreDialog, handleDeleteDialog } = useMaterialBinContext();
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={() => handleRestoreDialog(materialData.id)}
              size="icon"
              variant="outline"
            />
          }
        >
          <RotateCcw />
          <span className="sr-only">restore material</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Restore material</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={() => handleDeleteDialog(materialData.id)}
              size="icon"
              variant="destructive"
            />
          }
        >
          <Trash2 />
          <span className="sr-only">delete material permanently</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete material</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
