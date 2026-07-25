"use client";

import Link from "next/link";
import { useCallback } from "react";

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

import { useJobUpdate } from "../../api/job.api.hook";
import { ListJobsContractType } from "../../api/job.contract";
import { useJobTableContext } from "./JobTableContext";

export function JobTableRowAction({
  jobData,
}: {
  jobData: ListJobsContractType["output"]["data"]["data"][number];
}) {
  const {
    handleDeleteJobDialog,
    handleTimeUpdateDialog,
    handleInfoUpdateDialog,
  } = useJobTableContext();

  const { mutate: updateJob, isPending: isUpdateJobPending } = useJobUpdate({});

  const handleUpdateJobStatus = useCallback(
    (status: JobStatusEnumType) => {
      updateJob({
        jobId: jobData.id,
        status,
      });
    },
    [jobData.id, updateJob]
  );

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
                onClick={() => handleInfoUpdateDialog(jobData.id)}
              >
                <Info />
                <span>Update Information</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTimeUpdateDialog(jobData.id)}
              >
                <Clock />
                <span>Update Time</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleDeleteJobDialog(jobData.id)}
          variant="destructive"
        >
          <Trash2 />
          <span>Delete Job</span>
        </DropdownMenuItem>
      </DataTableRowMenu>
    </>
  );
}
