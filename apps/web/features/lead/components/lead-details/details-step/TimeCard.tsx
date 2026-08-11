"use client";

import { CalendarDays, Clock } from "lucide-react";

import { formatDateWithTimezone } from "@workspace/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";

import { FormatDateCell } from "@/components/shared/format-date/FormatDateCell";

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

interface TimeCardProps {
  createdAt: Date;
  schedules?: Array<{ startAt: Date; endAt: Date }>;
}

export function TimeCard({ createdAt, schedules }: TimeCardProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            <span className="font-semibold text-lg">Time</span>
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
          <FormatDateCell
            className="text-sm font-semibold tracking-tight"
            format="dd MMM, yyyy"
            value={timeValue}
          />
        )}
      </div>
      {timeValue ? (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-border/50 text-[11px] font-medium text-muted-foreground shadow-sm">
          <Clock className="size-3" />
          <FormatDateCell format="hh:mm aa" value={timeValue} />
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
  const user = useAuthStore((state) => state.user!);

  return (
    <div className="flex flex-col gap-1 items-center justify-between p-2 rounded-md border">
      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
        {title}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold tracking-tight">
          {`${formatDateWithTimezone(
            startTime,
            "dd MMM, yyyy",
            user.timezone
          )} - ${formatDateWithTimezone(
            endTime,
            "dd MMM, yyyy",
            user.timezone
          )}`}
        </span>
      </div>
    </div>
  );
}
