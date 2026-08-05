"use client";

import { useState } from "react";

import { DollarSign, History, Pen } from "lucide-react";

import { formatCurrency } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
} from "@workspace/ui/components/stat";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { JobRevenueUpdateDialog } from "@/features/job/components/JobRevenueUpdateDialog";

import { RevenueHistoryDialog } from "./RevenueHistories";

export function LeadRevenueStats({
  leadId,
  jobId,
  totalExpectedRevenue,
  totalInvoicedRevenue,
  totalReceivedRevenue,
  totalMissedRevenue,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
  totalExpectedRevenue?: string | null | undefined;
  totalInvoicedRevenue?: string | null | undefined;
  totalReceivedRevenue?: string | null | undefined;
  totalMissedRevenue?: string | null | undefined;
}) {
  const [openHistoryDialog, setOpenHistoryDialog] = useState<boolean>(false);
  const [openRevenueUpdateDialog, setOpenRevenueUpdateDialog] =
    useState<boolean>(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="size-5 text-primary" />
          <h3 className="font-semibold text-lg">Financial Overview</h3>
          <div className="ml-auto flex items-center gap-2">
            {jobId && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      onClick={() =>
                        setOpenRevenueUpdateDialog((prev) => !prev)
                      }
                      size="icon"
                      variant="secondary"
                    />
                  }
                >
                  <Pen />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update Revenue</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={() => setOpenHistoryDialog((prev) => !prev)}
                    variant="secondary"
                  />
                }
              >
                <History />
                <span>History</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Revenue Changed History</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat>
            <StatLabel>Total Expected</StatLabel>
            <StatValue>
              {totalExpectedRevenue
                ? formatCurrency(Number(totalExpectedRevenue))
                : "$0.00"}
            </StatValue>
            <StatIndicator variant="icon" color="info">
              <DollarSign />
            </StatIndicator>
          </Stat>
          <Stat>
            <StatLabel>Total Invoiced</StatLabel>
            <StatValue>
              {totalInvoicedRevenue
                ? formatCurrency(Number(totalInvoicedRevenue))
                : "$0.00"}
            </StatValue>
            <StatIndicator variant="icon" color="warning">
              <DollarSign />
            </StatIndicator>
          </Stat>
          <Stat>
            <StatLabel>Total Received</StatLabel>
            <StatValue className="text-success">
              {totalReceivedRevenue
                ? formatCurrency(Number(totalReceivedRevenue))
                : "$0.00"}
            </StatValue>
            <StatIndicator variant="icon" color="success">
              <DollarSign />
            </StatIndicator>
          </Stat>
          <Stat>
            <StatLabel>Total Missed</StatLabel>
            <StatValue className="text-destructive">
              {totalMissedRevenue
                ? formatCurrency(Number(totalMissedRevenue))
                : "$0.00"}
            </StatValue>
            <StatIndicator variant="icon" color="error">
              <DollarSign />
            </StatIndicator>
          </Stat>
        </div>
      </div>
      {jobId && (
        <JobRevenueUpdateDialog
          open={openRevenueUpdateDialog}
          onOpenChange={setOpenRevenueUpdateDialog}
          defaultValues={{
            expectedRevenue: totalExpectedRevenue ?? undefined,
            invoicedRevenue: totalInvoicedRevenue ?? undefined,
            receivedRevenue: totalReceivedRevenue ?? undefined,
            jobId,
          }}
        />
      )}
      <RevenueHistoryDialog
        open={openHistoryDialog}
        onOpenChange={setOpenHistoryDialog}
        leadId={leadId}
        jobId={jobId}
      />
    </>
  );
}
