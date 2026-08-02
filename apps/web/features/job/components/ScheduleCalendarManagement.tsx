"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { Banknote, Calendar, Receipt, TrendingUp } from "lucide-react";

import {
  Dialog,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { RefreshButton } from "@workspace/ui/components/refresh-button";
import {
  CalendarEventContentArg,
  CalenderEventInput,
  EventClickType,
  ScheduleCalendar,
} from "@workspace/ui/components/schedule-calendar";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { UserAvatar } from "@/components/UserAvatar";

import { orpcTQClient } from "@/server/orpc.client";

import { ListJobScheduleContractType } from "../api/job.contract";

export function ScheduleCalendarManagement() {
  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.job.listSchedule.queryOptions()
  );

  return (
    <div className="max-w-6xl w-full mx-auto space-y-2">
      <RefreshButton isLoading={isLoading} onButtonClick={refetch} />
      <QueryStateBoundary
        data={data?.data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={() => false}
      >
        {(data) => <ScheduleCalendarView data={data} />}
      </QueryStateBoundary>
    </div>
  );
}

interface JobCalendarEvent extends Omit<
  ListJobScheduleContractType["output"]["data"][number],
  "job"
> {
  jobId: string;
  expectedRevenue: string;
  invoicedRevenue: string;
  receivedRevenue: string;
  assignmentCount: number;
}

function mapJobScheduleToCalendarEvents(
  jobSchedule: ListJobScheduleContractType["output"]["data"][number]
): CalenderEventInput[] {
  const events: CalenderEventInput[] = [];

  const extendedProps: JobCalendarEvent = {
    id: jobSchedule.id,
    jobId: jobSchedule.job.id,
    title: jobSchedule.title,
    startAt: jobSchedule.startAt,
    endAt: jobSchedule.endAt,
    expectedRevenue: jobSchedule.job.expectedRevenue ?? "0",
    invoicedRevenue: jobSchedule.job.invoicedRevenue ?? "0",
    receivedRevenue: jobSchedule.job.receivedRevenue ?? "0",
    assignmentCount: jobSchedule.assignments.length,
    assignments: jobSchedule.assignments,
    createdAt: jobSchedule.createdAt,
    updatedAt: jobSchedule.updatedAt,
  };

  events.push({
    id: `${jobSchedule.id}:service`,
    start: jobSchedule.startAt,
    end: jobSchedule.endAt,
    title: jobSchedule.title,
    editable: false,
    borderColor: "var(--chart-2)",
    extendedProps: extendedProps,
  });

  return events;
}

function JobCalendarEventContent({
  eventInfo,
}: {
  eventInfo: CalendarEventContentArg;
}) {
  const borderColor = eventInfo.borderColor || "var(--accent)";

  return (
    <div
      className="flex flex-col h-full w-full bg-popover text-foreground items-start gap-1 cursor-pointer overflow-hidden rounded-md border-l-4 px-2 py-1 shadow-sm"
      style={{ borderColor }}
    >
      <div className="flex items-center justify-between w-full">
        <span className="truncate text-xs font-medium">
          {eventInfo.event.title}
        </span>

        <span className="text-[10px] opacity-60">{eventInfo.timeText}</span>
      </div>
    </div>
  );
}

function ScheduleCalendarView({
  data,
}: {
  data: ListJobScheduleContractType["output"]["data"];
}) {
  const [jobContent, setJobContent] = useState<
    (JobCalendarEvent & { title: string; start: Date | null }) | null
  >(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const events = useMemo<CalenderEventInput[]>(
    () => data.flatMap(mapJobScheduleToCalendarEvents),
    [data]
  );

  const handleEventClick: EventClickType = useCallback(
    (arg) => {
      const props = arg.event.extendedProps as JobCalendarEvent;
      setOpenDialog((prev) => !prev);
      setJobContent({
        ...props,
        title: arg.event.title,
        start: arg.event.start,
      });
    },
    [setOpenDialog]
  );

  return (
    <>
      <ScheduleCalendar
        events={events}
        eventContent={(info) => <JobCalendarEventContent eventInfo={info} />}
        eventClick={handleEventClick}
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {jobContent && <JobEventContent event={jobContent} />}
      </Dialog>
    </>
  );
}

function JobEventContent({
  event,
}: {
  event: JobCalendarEvent & { title: string; start: Date | null };
}) {
  const revenueCollected =
    parseFloat(event.receivedRevenue) > 0
      ? (
          (parseFloat(event.receivedRevenue) /
            parseFloat(event.invoicedRevenue)) *
          100
        ).toFixed(0)
      : null;

  return (
    <DialogResponsiveContent>
      <DialogStickyHeader>
        <DialogTitle className="flex items-center gap-2">
          {event.title}
          <Link
            href={{ pathname: `/dashboard/organization/jobs/${event.jobId}` }}
            className="text-xs text-muted-foreground hover:underline hover:text-primary"
          >
            View details
          </Link>
        </DialogTitle>
      </DialogStickyHeader>
      <DialogResponsiveBody>
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Schedule
          </p>
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>
              {event.start ? formatDate(event.start, "p - PP") : "N/A"}
            </span>
          </div>
        </div>

        {event.assignmentCount > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Team assignments
              </p>
              <ScrollArea className="max-h-30 overflow-auto">
                <div className="flex flex-col h-full gap-2 items-start justify-start w-full">
                  {event.assignments.map(({ assignedToMember }) => (
                    <UserAvatar
                      key={assignedToMember.userId}
                      userName={assignedToMember.name}
                      userEmail={assignedToMember.email}
                      imageUrl={assignedToMember.image}
                      userRoles={assignedToMember.roles}
                      showDetails
                      showRoleDetails
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        <Separator className="my-3" />

        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Revenue
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <RevenueCell
              icon={<TrendingUp className="size-4" />}
              label="Expected"
              value={event.expectedRevenue}
            />
            <RevenueCell
              icon={<Receipt className="size-4" />}
              label="Invoiced"
              value={event.invoicedRevenue}
            />
            <RevenueCell
              icon={<Banknote className="size-4" />}
              label="Received"
              value={event.receivedRevenue}
              highlight={parseFloat(event.receivedRevenue) > 0}
            />
          </div>
          {revenueCollected && (
            <p className="text-[10px] text-muted-foreground text-right">
              {revenueCollected}% of invoiced collected
            </p>
          )}
        </div>
      </DialogResponsiveBody>
    </DialogResponsiveContent>
  );
}

function RevenueCell({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md p-1.5 text-center",
        highlight ? "bg-green-500/10" : "bg-muted"
      )}
    >
      <div className="flex justify-center text-muted-foreground mb-0.5">
        {icon}
      </div>
      <p
        className={cn(
          "text-xs font-semibold tabular-nums",
          highlight && "text-green-600 dark:text-green-400"
        )}
      >
        ${parseFloat(value).toLocaleString()}
      </p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}
