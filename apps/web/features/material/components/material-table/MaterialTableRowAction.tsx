"use client";

import { Trash } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

import { ListMaterialOutput } from "../../api/material.contract";
import { MaterialUpdateDialog } from "../MaterialUpdateDialog";
import { useMaterialTableContext } from "./MaterialTableContext";

export function MaterialTableRowAction({
  materialData,
}: {
  materialData: ListMaterialOutput["data"][number];
}) {
  "use no memo";
  const isAllowUpdate = usePermissionCheckWithOrg([
    "org.material.manage",
    "org.material.update",
  ]);
  const isAllowDelete = usePermissionCheckWithOrg([
    "org.material.manage",
    "org.material.delete",
  ]);
  const { handleDeleteDialog } = useMaterialTableContext();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isAllowUpdate && (
        <MaterialUpdateDialog
          materialId={materialData.id}
          initialData={{
            name: materialData.name,
            sku: materialData.sku,
            description: materialData?.description || "",
            unit: materialData.unit,
            unitPrice: materialData.unitPrice,
            costPrice: materialData?.costPrice || "0.00",
            stockQuantity: materialData.stockQuantity,
            minimumStockLevel: materialData?.minimumStockLevel || "0",
          }}
        />
      )}
      {isAllowDelete && (
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
            <Trash />
            <span className="sr-only">delete material</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
