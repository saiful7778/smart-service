"use client";

import { useState } from "react";

import { formatDate } from "date-fns";
import { CalendarDays, Clock, Pen } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";

import { JobTimeUpdateDialog } from "@/features/job/components/JobTimeUpdateDialog";

interface TimeCardProps {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
  createdAt: Date;
  schedules?: Array<{ startAt: Date; endAt: Date }>;
}

export function TimeCard({
  jobId,
  leadId,
  createdAt,
  schedules,
}: TimeCardProps) {
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            <span className="font-semibold text-lg">Time</span>
            {jobId && (
              <div className="ml-auto">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => setOpenUpdateDialog(true)}
                      />
                    }
                  >
                    <Pen />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Update Time</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          <TimeItem title="Registered At" timeValue={createdAt} />
          {schedules &&
            schedules.map((schedule, idx) => (
              <TimeRangeItem
                key={`schedule-${idx}`}
                title="Schedule At"
                startTime={schedule.startAt}
                endTime={schedule.endAt}
              />
            ))}
        </CardContent>
      </Card>
      {jobId && (
        <JobTimeUpdateDialog
          leadId={leadId}
          open={openUpdateDialog}
          onOpenChange={setOpenUpdateDialog}
          initialData={{
            jobId,
          }}
        />
      )}
    </>
  );
}

function TimeItem({
  title,
  timeValue,
  isHighlighted = false,
}: {
  title: string;
  timeValue: Date | null | undefined;
  isHighlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded-md border",
        isHighlighted && "bg-primary/10"
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
          {title}
        </span>
        {timeValue && (
          <span className="text-sm font-semibold tracking-tight">
            {formatDate(timeValue, "dd MMM, yyyy")}
          </span>
        )}
      </div>
      {timeValue ? (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-border/50 text-[11px] font-medium text-muted-foreground shadow-sm">
          <Clock className="size-3" />
          <span>{formatDate(timeValue, "hh:mm aa")}</span>
        </div>
      ) : (
        <span className="text-sm font-semibold tracking-tight">N/A</span>
      )}
    </div>
  );
}

function TimeRangeItem({
  title,
  startTime,
  endTime,
}: {
  title: string;
  startTime: Date;
  endTime: Date;
}) {
  return (
    <div className="flex flex-col gap-1 items-center justify-between p-2 rounded-md border">
      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
        {title}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold tracking-tight">
          {`${formatDate(startTime, "dd MMM, yyyy")} - ${formatDate(endTime, "dd MMM, yyyy")}`}
        </span>
      </div>
    </div>
  );
}
