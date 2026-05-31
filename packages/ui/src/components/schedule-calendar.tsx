"use client";

import React from "react";

import type {
  CalendarApi,
  DateSelectArg,
  DatesSetArg,
  EventAddArg,
  EventChangeArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
  EventRemoveArg,
  EventSourceInput,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  type DateClickArg,
  type DropArg,
  type EventDragStartArg,
  type EventDragStopArg,
  type EventLeaveArg,
  type EventReceiveArg,
  type EventResizeDoneArg,
  type EventResizeStartArg,
  type EventResizeStopArg,
} from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";

import "@workspace/ui/components/schedule-calendar.css";
import { cn } from "@workspace/ui/lib/utils";

export type CalendarEventType = EventSourceInput;
export type CalenderEventInput = EventInput;
export type CalendarEventContentArg = EventContentArg;

export type EventClickType = (arg: EventClickArg) => void;
export type EventChangeType = (arg: EventChangeArg) => void;
export type EventAddType = (arg: EventAddArg) => void;
export type EventRemoveType = (arg: EventRemoveArg) => void;
export type EventDragStartType = (arg: EventDragStartArg) => void;
export type EventDragStopType = (arg: EventDragStopArg) => void;
export type EventDropType = (arg: EventDropArg) => void;
export type EventResizeStartType = (arg: EventResizeStartArg) => void;
export type EventResizeStopType = (arg: EventResizeStopArg) => void;
export type EventResizeType = (arg: EventResizeDoneArg) => void;
export type EventReceiveType = (arg: EventReceiveArg) => void;
export type EventLeaveType = (arg: EventLeaveArg) => void;

export type DropType = (arg: DropArg) => void;

export type DateClickType = (arg: DateClickArg) => void;
export type DatesSetType = (arg: DatesSetArg) => void;
export type DateSelectType = (arg: DateSelectArg) => void;

export interface FullCalendarRef {
  getApi: () => CalendarApi | undefined;
}

export interface FullCalendarProps extends Omit<
  React.ComponentProps<typeof FullCalendar>,
  "height" | "events"
> {
  events: CalendarEventType | undefined;
  className?: string;
  ref?: React.ForwardedRef<FullCalendarRef>;
}

export function ScheduleCalendar({
  events,
  headerToolbar = {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  footerToolbar = {
    right: "today prev,next",
  },
  titleFormat = {
    year: "2-digit",
    month: "long",
  },
  initialView = "dayGridMonth",
  nowIndicator = true,
  editable = true,
  selectable = true,
  className,
  ref,
  ...props
}: FullCalendarProps) {
  const calendarRef = React.useRef<FullCalendar>(null);

  React.useImperativeHandle(ref, () => ({
    getApi: () => calendarRef.current?.getApi(),
  }));

  return (
    <div className={cn("schedule-calendar-wrapper w-full relative", className)}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={headerToolbar}
        footerToolbar={footerToolbar}
        titleFormat={titleFormat}
        events={events}
        nowIndicator={nowIndicator}
        editable={editable}
        selectable={selectable}
        height="auto"
        {...props}
      />
    </div>
  );
}

export function EventItem({ eventInfo }: { eventInfo: EventContentArg }) {
  const textColor = eventInfo.textColor || "var(--foreground)";
  const backgroundColor = eventInfo.backgroundColor || "var(--muted)";
  const borderColor = eventInfo.borderColor || "var(--primary)";
  return (
    <div
      className="flex h-full w-full items-center gap-1.5 overflow-hidden rounded-md border-l-4 border-solid px-2 py-1 shadow-sm"
      style={{ color: textColor, backgroundColor, borderColor }}
    >
      <span className="truncate text-xs font-medium">
        {eventInfo.event.title}
      </span>
      {eventInfo.timeText && (
        <span className="ml-auto text-[10px] text-muted-foreground">
          {eventInfo.timeText}
        </span>
      )}
    </div>
  );
}
