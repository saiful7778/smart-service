import { Meta, StoryObj } from "@storybook/react-vite";

import {
  EventItem,
  ScheduleCalendar,
} from "@workspace/ui/components/schedule-calendar";
import type {
  DateSelectType,
  DatesSetType,
  DropType,
  EventAddType,
  EventChangeType,
  EventClickType,
  EventDragStartType,
  EventDragStopType,
  EventDropType,
  EventLeaveType,
  EventReceiveType,
  EventRemoveType,
  EventResizeStartType,
  EventResizeStopType,
  EventResizeType,
} from "@workspace/ui/components/schedule-calendar";

const meta = {
  title: "UI/calendar/schedule-calendar",
  component: ScheduleCalendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ScheduleCalendar>;

export default meta;
type Story = StoryObj<typeof ScheduleCalendar>;

export const Default: Story = {
  args: {
    events: [
      {
        id: "1",
        title: "Meeting with Team",
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
      },
      {
        id: "2",
        title: "Lunch Break",
        start: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        allDay: true,
      },
      {
        id: "3",
        title: "Project Deadline",
        start: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        end: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
      },
    ],
  },
  render: (args) => {
    const onEventDrop: EventDropType = (arg) => {
      console.log("onEventDrop:", arg);
    };
    const onEventResize: EventResizeType = (arg) => {
      console.log("onEventResize:", arg);
    };
    const onSelect: DateSelectType = (arg) => {
      console.log("onSelect:", arg);
    };
    const onEventClick: EventClickType = (arg) => {
      console.log("onEventClick:", arg);
    };
    const onEventChange: EventChangeType = (arg) => {
      console.log("onEventChange:", arg);
    };
    const onEventAdd: EventAddType = (arg) => {
      console.log("onEventAdd:", arg);
    };
    const onEventRemove: EventRemoveType = (arg) => {
      console.log("onEventRemove:", arg);
    };
    const onEventDragStart: EventDragStartType = (arg) => {
      console.log("onEventDragStart:", arg);
    };
    const onEventDragStop: EventDragStopType = (arg) => {
      console.log("onEventDragStop:", arg);
    };
    const onEventResizeStart: EventResizeStartType = (arg) => {
      console.log("onEventResizeStart:", arg);
    };
    const onEventResizeStop: EventResizeStopType = (arg) => {
      console.log("onEventResizeStop:", arg);
    };
    const onDrop: DropType = (arg) => {
      console.log("onDrop:", arg);
    };
    const onEventReceive: EventReceiveType = (arg) => {
      console.log("onEventReceive:", arg);
    };
    const onEventLeave: EventLeaveType = (arg) => {
      console.log("onEventLeave:", arg);
    };
    const onDatesSet: DatesSetType = (arg) => {
      console.log("onDatesSet:", arg);
    };

    return (
      <ScheduleCalendar
        {...args}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        select={onSelect}
        eventClick={onEventClick}
        eventChange={onEventChange}
        eventAdd={onEventAdd}
        eventRemove={onEventRemove}
        eventDragStart={onEventDragStart}
        eventDragStop={onEventDragStop}
        eventResizeStart={onEventResizeStart}
        eventResizeStop={onEventResizeStop}
        drop={onDrop}
        eventContent={(eventInfo) => <EventItem eventInfo={eventInfo} />}
        eventReceive={onEventReceive}
        eventLeave={onEventLeave}
        datesSet={onDatesSet}
      />
    );
  },
};
