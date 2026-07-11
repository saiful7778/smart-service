"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Clock,
  DollarSign,
  Eye,
  FileText,
  Info,
  Package,
  PenLine,
  Trash2,
} from "lucide-react";

import {
  LeadStatusEnumSchema,
  LeadStatusEnumType,
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

import { useLeadUpdate } from "../../api/lead.api.hook";
import { ListLeadOutputs } from "../../api/lead.contract";
import { RevenueHistoryDialog } from "../lead-details/details-step/RevenueHistories";
import { useLeadTableContext } from "./LeadTableContext";

export function LeadTableRowAction({
  leadData,
}: {
  leadData: ListLeadOutputs["data"][number];
}) {
  const [openRevenueHistoryDialog, setOpenRevenueHistoryDialog] =
    useState<boolean>(false);
  const { handleGeneralUpdateDialog, handleDeleteDialog } =
    useLeadTableContext();

  const { mutate: updateLead, isPending: isUpdateLeadPending } = useLeadUpdate(
    {}
  );

  const handleUpdateLeadStatus = (status: LeadStatusEnumType) => {
    updateLead({
      leadId: leadData.id,
      status,
    });
  };

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Manage Lead</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Eye className="size-4" />
              <span>Details</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>Lead Details</DropdownMenuLabel>
              <DropdownMenuItem
                render={
                  <Link
                    href={{
                      pathname: `/dashboard/organization/leads/${leadData.id}`,
                      search: "tab=details",
                    }}
                  >
                    <Info className="size-4" />
                    <span>Full Details</span>
                  </Link>
                }
              />
              <DropdownMenuItem
                onClick={() => setOpenRevenueHistoryDialog((prev) => !prev)}
              >
                <DollarSign className="size-4" />
                <span>Revenue History</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href={{
                      pathname: `/dashboard/organization/leads/${leadData.id}`,
                      search: "tab=jobs",
                    }}
                  >
                    <Package className="size-4" />
                    <span>Jobs</span>
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link
                    href={{
                      pathname: `/dashboard/organization/leads/${leadData.id}`,
                      search: "tab=history",
                    }}
                  >
                    <Clock className="size-4" />
                    <span>History</span>
                  </Link>
                }
              />

              <DropdownMenuItem
                render={
                  <Link
                    href={{
                      pathname: `/dashboard/organization/leads/${leadData.id}`,
                      search: "tab=attachments",
                    }}
                  >
                    <FileText className="size-4" />
                    <span>Attachments</span>
                  </Link>
                }
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PenLine className="size-4" />
              <span>Update</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>Update Lead Data</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Lead Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={leadData.status}
                      onValueChange={(value) =>
                        handleUpdateLeadStatus(value as LeadStatusEnumType)
                      }
                    >
                      {LeadStatusEnumSchema.options.map((status) => (
                        <DropdownMenuRadioItem
                          key={status}
                          value={status}
                          disabled={isUpdateLeadPending}
                        >
                          {formatEnumValue(status)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem
                onClick={() => handleGeneralUpdateDialog(leadData.id)}
              >
                <Info />
                <span>General Info</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleDeleteDialog(leadData.id)}
            variant="destructive"
          >
            <Trash2 />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DataTableRowMenu>

      <RevenueHistoryDialog
        open={openRevenueHistoryDialog}
        onOpenChange={setOpenRevenueHistoryDialog}
        leadId={leadData.id}
        jobId={undefined}
      />
    </>
  );
}
