"use client";

import Link from "next/link";
import { useState } from "react";

import { Edit, Eye, Trash } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { useLeadEstimateDelete } from "@/features/lead/api/leadEstimate.api.hook";
import { ListLeadEstimateContractType } from "@/features/lead/api/leadEstimate.contract";
import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

export function EstimateTableRowAction({
  estimateData,
}: {
  estimateData: ListLeadEstimateContractType["output"]["data"]["data"][number];
}) {
  const isAllowUpdate = usePermissionCheckWithOrg(
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

  const { mutate: deleteEstimate, isPending: isDeleting } =
    useLeadEstimateDelete({
      onSuccess: () => {
        setOpenDeleteDialog(false);
      },
    });

  const handleDelete = () => {
    deleteEstimate({
      leadId: estimateData.leadId,
      jobId: estimateData.jobId,
      estimateId: estimateData.id,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              nativeButton={false}
              size="icon"
              render={
                <Link
                  href={{
                    pathname: `/dashboard/organization/estimates/${estimateData.id}`,
                    query: {
                      ...(estimateData.leadId && {
                        leadId: estimateData.leadId,
                        redirectTo: `/dashboard/organization/leads/${estimateData.leadId}`,
                      }),
                      ...(estimateData.jobId && {
                        jobId: estimateData.jobId,
                        redirectTo: `/dashboard/organization/jobs/${estimateData.jobId}`,
                      }),
                    },
                  }}
                />
              }
            />
          }
        >
          <Eye />
          <span className="sr-only">view details</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>View details</p>
        </TooltipContent>
      </Tooltip>
      {isAllowUpdate && (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  nativeButton={false}
                  size="icon"
                  variant="secondary"
                  render={
                    <Link
                      href={{
                        pathname: `/dashboard/organization/estimates/${estimateData.id}/update`,
                        query: {
                          ...(estimateData.leadId && {
                            leadId: estimateData.leadId,
                            redirectTo: `/dashboard/organization/leads/${estimateData.leadId}`,
                          }),
                          ...(estimateData.jobId && {
                            jobId: estimateData.jobId,
                            redirectTo: `/dashboard/organization/jobs/${estimateData.jobId}`,
                          }),
                        },
                      }}
                    />
                  }
                />
              }
            >
              <Edit />
              <span className="sr-only">update estimate</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update estimate</p>
            </TooltipContent>
          </Tooltip>
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
              <p>Delete estimate</p>
            </TooltipContent>
          </Tooltip>
          <DeleteConfirmDialog
            title="Delete Estimate"
            description="Are you sure you want to delete this estimate?"
            open={openDeleteDialog}
            onOpenChange={setOpenDeleteDialog}
            onConfirm={handleDelete}
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
}
