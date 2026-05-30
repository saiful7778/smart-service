import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { OrganizationTable } from "../org";
import { JobTable } from "./job.table";
import { ScheduleAssignementTable } from "./scheduleAssignement.table";
import { TimeEntryTable } from "./timeEntry.table";

export const ScheduleTable = pgTable(
  "schedules",
  {
    id: db_id,
    orgId: uuid("org_id").notNull(),
    jobId: uuid("job_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    startAt: timestamp("start_at", {
      withTimezone: true,
      precision: 3,
    }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true, precision: 3 }).notNull(),
    allDay: boolean("all_day").default(false).notNull(),
    recurrenceRule: text("recurrence_rule"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "schedules_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "schedules_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("schedules_org_id_idx").on(table.orgId),
    index("schedules_job_id_idx").on(table.jobId),
    index("schedules_start_at_idx").on(table.startAt),
    index("schedules_end_at_idx").on(table.endAt),
    index("schedules_created_at_idx").on(table.createdAt),
  ]
);

export const ScheduleRelations = relations(ScheduleTable, ({ one, many }) => ({
  organization: one(OrganizationTable, {
    fields: [ScheduleTable.orgId],
    references: [OrganizationTable.id],
    relationName: "ScheduleToOrg",
  }),
  job: one(JobTable, {
    fields: [ScheduleTable.jobId],
    references: [JobTable.id],
    relationName: "ScheduleToJob",
  }),
  assignments: many(ScheduleAssignementTable, {
    relationName: "ScheduleAssignementToSchedule",
  }),
  timeEntries: many(TimeEntryTable, {
    relationName: "TimeEntryToSchedule",
  }),
}));

export const selectScheduleSchema = createSelectSchema(ScheduleTable);
export const insertScheduleSchema = createInsertSchema(ScheduleTable);
export const updateScheduleSchema = createUpdateSchema(ScheduleTable);

export type ScheduleDataModel = typeof ScheduleTable.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type SelectSchedule = z.infer<typeof selectScheduleSchema>;
export type UpdateSchedule = z.infer<typeof updateScheduleSchema>;
