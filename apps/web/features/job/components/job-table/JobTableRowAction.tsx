"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Clock,
  DollarSign,
  Eye,
  FileText,
  Info,
  PenLine,
  Trash2,
  Users,
} from "lucide-react";

import {
  JobStatusEnumSchema,
  JobStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import DataTableRowMenu from "@workspace/ui/components/data-table/data-table-row-menu";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@workspace/ui/components/dropdown-menu";

import { useJobDelete, useJobUpdate } from "../../api/job.api.hook";
import { ListJobsContractType } from "../../api/job.contract";
import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";
import { JobGeneralInfoUpdateDialog } from "../job-details/details-step/JobGeneralInfoUpdateDialog";

export function JobTableRowAction({
  jobData,
}: {
  jobData: ListJobsContractType["output"]["data"]["data"][number];
}) {
  "use no memo"
  const [openInfoUpdateDialog, setOpenInfoUpdateDialog] =
      useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const { mutate: updateJob, isPending: isUpdateJobPending } = useJobUpdate({
    onSuccess: () => {
      setOpenInfoUpdateDialog(false)
    }
  });
  const { mutate: deleteJob, isPending: isDeletingJob } = useJobDelete({
      onSuccess: () => {
        setOpenDeleteDialog(false);
      },
    });

  const handleUpdateJobStatus = (status: JobStatusEnumType) => {
      updateJob({
        jobId: jobData.id,
        status,
      });
    }
  
    const handleDeleteJob = () => {
      deleteJob({ jobId: jobData.id })
    };

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Manage Job</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Eye className="size-4" />
              <span>Job Details</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>Job Details</DropdownMenuLabel>
              <DropdownMenuItem
                render={
                  <Link
                    href={{
                      pathname: `/dashboard/organization/jobs/${jobData.id}`,
                      search: "tab=details",
                    }}
                  />
                }
              >
                <Info className="size-4" />
                <span>Full Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DollarSign className="size-4" />
                <span>Revenue History</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href={{
                      pathname: `/dashboard/organization/jobs/${jobData.id}`,
                      search: "tab=assignments",
                    }}
                  />
                }
              >
                <Users className="size-4" />
                <span>Assignments</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href={{
                      pathname: `/dashboard/organization/jobs/${jobData.id}`,
                      search: "tab=history",
                    }}
                  />
                }
              >
                <Clock className="size-4" />
                <span>History</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href={{
                      pathname: `/dashboard/organization/jobs/${jobData.id}`,
                      search: "tab=attachments",
                    }}
                  />
                }
              >
                <FileText className="size-4" />
                <span>Attachments</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PenLine className="size-4" />
              <span>Update Job</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>Update Job</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={jobData.status}
                      onValueChange={handleUpdateJobStatus}
                    >
                      {JobStatusEnumSchema.options.map((status) => (
                        <DropdownMenuRadioItem
                          key={status}
                          value={status}
                          disabled={isUpdateJobPending}
                        >
                          {formatEnumValue(status)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                onClick={() => setOpenInfoUpdateDialog(true)}
              >
                <Info />
                <span>Update Information</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => setOpenDeleteDialog(true)}
          variant="destructive"
        >
          <Trash2 />
          <span>Delete Job</span>
        </DropdownMenuItem>
      </DataTableRowMenu>

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDeleteJob}
        isLoading={isDeletingJob}
        title={`Delete "${jobData.title}" job`}
      />
      <JobGeneralInfoUpdateDialog
        open={openInfoUpdateDialog}
        onOpenChange={setOpenInfoUpdateDialog}
        leadId={jobData.leadId}
        jobId={jobData.id}
        initialData={ {
                title: jobData.title,
                description: jobData.description || "",
                status: jobData.status,
              }
        }
      />
    </>
  );
}
