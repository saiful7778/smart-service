import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { OrganizationMemberTable } from "../org";
import { JobTable } from "./job.table";
import { ScheduleTable } from "./schedule.table";

export const TimeEntryTable = pgTable(
  "time_entries",
  {
    id: db_id,
    jobId: uuid("job_id").notNull(),
    memberId: uuid("member_id").notNull(),
    scheduleId: uuid("schedule_id"),

    startAt: timestamp("start_at", {
      withTimezone: true,
      precision: 3,
    }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true, precision: 3 }),
    durationMinutes: integer("duration_minutes"),
    billable: boolean("billable").default(true).notNull(),
    notes: text("notes"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "time_entries_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "time_entries_member_fkey",
      columns: [table.memberId],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "time_entries_schedule_fkey",
      columns: [table.scheduleId],
      foreignColumns: [ScheduleTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("time_entry_job_id_idx").on(table.jobId),
    index("time_entry_member_idx").on(table.memberId),
    index("time_entry_schedule_id_idx").on(table.scheduleId),
  ]
);

export const TimeEntryRelations = relations(TimeEntryTable, ({ one }) => ({
  job: one(JobTable, {
    fields: [TimeEntryTable.jobId],
    references: [JobTable.id],
    relationName: "TimeEntryToJob",
  }),
  member: one(OrganizationMemberTable, {
    fields: [TimeEntryTable.memberId],
    references: [OrganizationMemberTable.id],
    relationName: "TimeEntryToMember",
  }),
  schedule: one(ScheduleTable, {
    fields: [TimeEntryTable.scheduleId],
    references: [ScheduleTable.id],
    relationName: "TimeEntryToSchedule",
  }),
}));

export const insertTimeEntrySchema = createInsertSchema(TimeEntryTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  durationMinutes: true,
});
export const selectTimeEntrySchema = createSelectSchema(TimeEntryTable);
export const updateTimeEntrySchema = createUpdateSchema(TimeEntryTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  durationMinutes: true,
});

export type TimeEntryDataModel = typeof TimeEntryTable.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type SelectTimeEntry = z.infer<typeof selectTimeEntrySchema>;
export type UpdateTimeEntry = z.infer<typeof updateTimeEntrySchema>;
