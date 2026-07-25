"use client";

import Link from "next/link";
import { useState } from "react";

import { Edit, Info, Trash } from "lucide-react";

import { LeadEstimateStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import DataTableRowMenu from "@workspace/ui/components/data-table/data-table-row-menu";
import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@workspace/ui/components/dropdown-menu";

import {
  useLeadEstimateDelete,
  useLeadEstimateUpdate,
} from "@/features/lead/api/leadEstimate.api.hook";
import { ListLeadEstimateContractType } from "@/features/lead/api/leadEstimate.contract";
import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

export function LeadEstimateTableRowAction({
  estimateData,
}: {
  estimateData: ListLeadEstimateContractType["output"]["data"]["data"][number];
}) {
  const isAllowRead = usePermissionCheckWithOrg(
    estimateData.leadId
      ? ["org.lead_estimate.manage", "org.lead_estimate.read"]
      : estimateData.jobId
        ? ["org.job_estimate.manage", "org.job_estimate.read"]
        : [
            "org.lead_estimate.manage",
            "org.lead_estimate.read",
            "org.job_estimate.manage",
            "org.job_estimate.read",
          ]
  );
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

  const { mutate: updateEstimate, isPending: isUpdating } =
    useLeadEstimateUpdate({});

  const handleDelete = () => {
    deleteEstimate({
      leadId: estimateData.leadId,
      jobId: estimateData.jobId,
      estimateId: estimateData.id,
    });
  };

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuGroup>
          {isAllowRead && (
            <DropdownMenuItem
              nativeButton={false}
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
            >
              <Info />
              <span>Details</span>
            </DropdownMenuItem>
          )}
          {isAllowUpdate && (
            <DropdownMenuItem
              nativeButton={false}
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
            >
              <Edit />
              <span>Update</span>
            </DropdownMenuItem>
          )}
          {isAllowUpdate && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuGroup>
                  <DropdownMenuRadioGroup
                    value={estimateData.status}
                    onValueChange={(value) =>
                      updateEstimate({
                        estimateId: estimateData.id,
                        leadId: estimateData.leadId,
                        jobId: estimateData.jobId,
                        status: value,
                      })
                    }
                  >
                    {LeadEstimateStatusEnumSchema.options.map((status) => (
                      <DropdownMenuRadioItem
                        key={status}
                        value={status}
                        disabled={isUpdating}
                      >
                        {formatEnumValue(status)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          {isAllowDelete && (
            <DropdownMenuItem
              onClick={() => setOpenDeleteDialog(true)}
              variant="destructive"
            >
              <Trash />
              <span>Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DataTableRowMenu>

      <DeleteConfirmDialog
        title="Delete Estimate"
        description="Are you sure you want to delete this estimate?"
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
