import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  pgTable,
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
import { JobScheduleTable } from "./jobSchedule.table";

export const JobTimeEntryTable = pgTable(
  "job_time_entries",
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
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "job_time_entries_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_time_entries_member_fkey",
      columns: [table.memberId],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_time_entries_schedule_fkey",
      columns: [table.scheduleId],
      foreignColumns: [JobScheduleTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("job_time_entry_job_id_idx").on(table.jobId),
    index("job_time_entry_member_idx").on(table.memberId),
    index("job_time_entry_schedule_id_idx").on(table.scheduleId),
    index("job_time_entry_startAt_idx").on(table.startAt),
    index("job_time_entry_endAt_idx").on(table.endAt),
  ]
);

export const JobTimeEntryRelations = relations(
  JobTimeEntryTable,
  ({ one }) => ({
    job: one(JobTable, {
      fields: [JobTimeEntryTable.jobId],
      references: [JobTable.id],
      relationName: "JobTimeEntryToJob",
    }),
    member: one(OrganizationMemberTable, {
      fields: [JobTimeEntryTable.memberId],
      references: [OrganizationMemberTable.id],
      relationName: "JobTimeEntryToMember",
    }),
    schedule: one(JobScheduleTable, {
      fields: [JobTimeEntryTable.scheduleId],
      references: [JobScheduleTable.id],
      relationName: "JobTimeEntryToSchedule",
    }),
  })
);

export const insertJobTimeEntrySchema = createInsertSchema(
  JobTimeEntryTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  durationMinutes: true,
});
export const selectJobTimeEntrySchema = createSelectSchema(JobTimeEntryTable);
export const updateJobTimeEntrySchema = createUpdateSchema(
  JobTimeEntryTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  durationMinutes: true,
});

export type JobTimeEntryDataModel = typeof JobTimeEntryTable.$inferSelect;
export type InsertJobTimeEntry = z.infer<typeof insertJobTimeEntrySchema>;
export type SelectJobTimeEntry = z.infer<typeof selectJobTimeEntrySchema>;
export type UpdateJobTimeEntry = z.infer<typeof updateJobTimeEntrySchema>;
