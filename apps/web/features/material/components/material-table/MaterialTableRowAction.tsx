"use client";

import { useState } from "react";

import { Pen, Trash } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

import { ListMaterialContractType } from "../../api/material.contract";
import { MaterialDeleteDialog } from "../MaterialDeleteDialog";
import { MaterialUpdateDialog } from "../MaterialUpdateDialog";

export function MaterialTableRowAction({
  materialData,
}: {
  materialData: ListMaterialContractType["output"]["data"]["data"][number];
}) {
  "use no memo";
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const isAllowUpdate = usePermissionCheckWithOrg([
    "org.material.manage",
    "org.material.update",
  ]);
  const isAllowDelete = usePermissionCheckWithOrg([
    "org.material.manage",
    "org.material.delete",
  ]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isAllowUpdate && (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => setOpenUpdateDialog(true)}
                  size="icon"
                  variant="outline"
                />
              }
            >
              <Pen />
              <span className="sr-only">update material</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update materila</p>
            </TooltipContent>
          </Tooltip>

          <MaterialUpdateDialog
            open={openUpdateDialog}
            setOpen={setOpenUpdateDialog}
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
        </>
      )}
      {isAllowDelete && (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => setOpenDeleteDialog(true)}
                  size="icon"
                  variant="destructive"
                />
              }
            >
              <Trash />
              <span className="sr-only">delete material</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete material</p>
            </TooltipContent>
          </Tooltip>

          <MaterialDeleteDialog
            open={openDeleteDialog}
            setOpen={setOpenDeleteDialog}
            materialId={materialData.id}
          />
        </>
      )}
    </div>
  );
}
