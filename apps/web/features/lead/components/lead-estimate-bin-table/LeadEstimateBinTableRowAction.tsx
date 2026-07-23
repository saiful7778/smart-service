"use client";

import { useState } from "react";

import { RotateCcw, Trash } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import {
  useLeadEstimateBinDelete,
  useLeadEstimateRestore,
} from "@/features/lead/api/leadEstimate.api.hook";
import { ListLeadEstimateBinContractType } from "@/features/lead/api/leadEstimateBin.contract";
import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

export function LeadEstimateBinTableRowAction({
  estimateData,
}: {
  estimateData: ListLeadEstimateBinContractType["output"]["data"]["data"][number];
}) {
  const isAllowRestore = usePermissionCheckWithOrg(
    estimateData.leadId
      ? ["org.lead_estimate.manage", "org.lead_estimate.update"]
      : estimateData.jobId
        ? ["org.job_estimate.manage", "org.job_estimate.update"]
        : [
            "org.lead_estimate.manage",
            "org.lead_estimate.update",
            "org.job_estimate.manage",
            "org.job_estimate.update",
          ]
  );
  const isAllowDelete = usePermissionCheckWithOrg(
    estimateData.leadId
      ? ["org.lead_estimate.manage", "org.lead_estimate.delete"]
      : estimateData.jobId
        ? ["org.job_estimate.manage", "org.job_estimate.delete"]
        : [
            "org.lead_estimate.manage",
            "org.lead_estimate.delete",
            "org.job_estimate.manage",
            "org.job_estimate.delete",
          ]
  );
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);

  const { mutate: deleteEstimate, isPending: isDeleting } =
    useLeadEstimateBinDelete({
      onSuccess: () => {
        setOpenDeleteDialog(false);
      },
    });
  const { mutate: restoreEstimate, isPending: isRestoring } =
    useLeadEstimateRestore({
      onSuccess: () => {
        setOpenRestoreDialog(false);
      },
    });

  const handleDelete = () => {
    deleteEstimate({
      leadId: estimateData.leadId,
      jobId: estimateData.jobId,
      estimateId: estimateData.id,
    });
  };

  const handleRestore = () => {
    restoreEstimate({
      leadId: estimateData.leadId,
      jobId: estimateData.jobId,
      estimateId: estimateData.id,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isAllowRestore && (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => setOpenRestoreDialog(true)}
                  size="icon"
                  variant="outline"
                />
              }
            >
              <RotateCcw />
              <span className="sr-only">restore estimate</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Restore estimate</p>
            </TooltipContent>
          </Tooltip>
          <DeleteConfirmDialog
            open={openRestoreDialog}
            onOpenChange={setOpenRestoreDialog}
            onConfirm={handleRestore}
            isLoading={isRestoring}
            icon={<RotateCcw className="size-4 text-primary" />}
            title="Restore Estimate"
            description="Are you sure you want to restore this estimate? It will become active again."
            confirmText="Restore"
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
              <span className="sr-only">delete estimate</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Permanently delete</p>
            </TooltipContent>
          </Tooltip>
          <DeleteConfirmDialog
            open={openDeleteDialog}
            onOpenChange={setOpenDeleteDialog}
            onConfirm={handleDelete}
            isLoading={isDeleting}
            title="Delete Permanently?"
            description="This estimate will be permanently deleted from the bin and cannot be recovered. Are you sure you want to continue?"
            confirmText="Delete Permanently"
          />
        </>
      )}
    </div>
  );
}
