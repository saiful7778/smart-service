"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { CircleQuestionMark, TrendingDown, TrendingUp } from "lucide-react";

import {
  Dialog,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { RefreshButton } from "@workspace/ui/components/refresh-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { UserAvatar } from "@/components/UserAvatar";

import { orpcTQClient } from "@/server/orpc.client";
import { formatCurrency } from "@/utils/formatCurrency";

interface RevenueHistoryDialogProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}

export function RevenueHistoryDialog({
  open,
  onOpenChange,
  leadId,
  jobId,
}: RevenueHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-5xl">
        <DialogStickyHeader>
          <DialogTitle>Revenue History</DialogTitle>
          <DialogDescription>
            This data shows the history of changes to the revenue fields for
            this lead.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <RevenueHistories leadId={leadId} jobId={jobId} />
        </DialogResponsiveBody>
      </DialogResponsiveContent>
    </Dialog>
  );
}

export function RevenueHistories({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.lead.revenueHistory.queryOptions({
      input: {
        leadId,
        jobId,
      },
    })
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <RefreshButton
          isLoading={isLoading}
          className="ml-auto"
          onButtonClick={() => refetch()}
        />
      </div>
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data?.data}
        isEmpty={(d) => d?.length === 0}
        emptyFallback={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleQuestionMark className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No history found</EmptyTitle>
              <EmptyDescription>
                There are currently no revenue history found for this lead.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        {(data) => (
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50 border-y-0">
                <TableRow className="hover:bg-transparent border-b-0">
                  <TableHead className="w-12.5 font-bold text-foreground/70">
                    #
                  </TableHead>
                  <TableHead className="font-bold text-foreground/70">
                    Type
                  </TableHead>
                  <TableHead className="font-bold text-foreground/70">
                    Job Title
                  </TableHead>
                  <TableHead className="font-bold text-foreground/70">
                    Previous
                  </TableHead>
                  <TableHead className="font-bold text-foreground/70">
                    New Value
                  </TableHead>
                  <TableHead className="font-bold text-foreground/70">
                    Changed By
                  </TableHead>
                  <TableHead className="font-bold text-foreground/70">
                    Changed At
                  </TableHead>
                  <TableHead className="font-bold text-foreground/70">
                    Reason
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => {
                  const isIncrease =
                    Number(item.newValue) > Number(item.oldValue);
                  const isDecrease =
                    Number(item.newValue) < Number(item.oldValue);

                  return (
                    <TableRow
                      key={idx}
                      className="border-b transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="font-medium text-muted-foreground/60">
                        {String(idx + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="capitalize font-medium">
                        {item.revenueType.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground/60">
                        {item.job?.title ?? "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(Number(item.oldValue))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              "font-semibold",
                              isIncrease && "text-success",
                              isDecrease && "text-destructive"
                            )}
                          >
                            {formatCurrency(Number(item.newValue))}
                          </span>
                          {isIncrease && (
                            <TrendingUp className="size-3.5 text-success" />
                          )}
                          {isDecrease && (
                            <TrendingDown className="size-3.5 text-destructive" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <UserAvatar
                          userName={item.changedBy.name}
                          userEmail={item.changedBy.email}
                          imageUrl={item.changedBy.image}
                          userRoles={item.changedBy.roles}
                          showDetails
                          showRoleDetails
                        />
                      </TableCell>
                      <TableCell className="text-x text-muted-foreground italic">
                        {formatDate(item.changedAt, "p - PP")}
                      </TableCell>
                      <TableCell className="max-w-50 truncate">
                        {item.changeReason ?? "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </QueryStateBoundary>
    </div>
  );
}
