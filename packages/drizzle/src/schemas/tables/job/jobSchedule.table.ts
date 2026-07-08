import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
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
import { JobScheduleAssignementTable } from "./jobScheduleAssignement.table";
import { JobTimeEntryTable } from "./jobTimeEntry.table";

export const JobScheduleTable = pgTable(
  "job_schedules",
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
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "job_schedules_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_schedules_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("job_schedules_org_id_idx").on(table.orgId),
    index("job_schedules_job_id_idx").on(table.jobId),
    index("job_schedules_start_at_idx").on(table.startAt),
    index("job_schedules_end_at_idx").on(table.endAt),
    index("job_schedules_created_at_idx").on(table.createdAt),
  ]
);

export const JobScheduleRelations = relations(
  JobScheduleTable,
  ({ one, many }) => ({
    organization: one(OrganizationTable, {
      fields: [JobScheduleTable.orgId],
      references: [OrganizationTable.id],
      relationName: "JobScheduleToOrg",
    }),
    job: one(JobTable, {
      fields: [JobScheduleTable.jobId],
      references: [JobTable.id],
      relationName: "JobScheduleToJob",
    }),
    assignments: many(JobScheduleAssignementTable, {
      relationName: "JobScheduleAssignementToSchedule",
    }),
    timeEntries: many(JobTimeEntryTable, {
      relationName: "JobTimeEntryToSchedule",
    }),
  })
);

export const selectJobScheduleSchema = createSelectSchema(JobScheduleTable);
export const insertJobScheduleSchema = createInsertSchema(JobScheduleTable);
export const updateJobScheduleSchema = createUpdateSchema(JobScheduleTable);

export type JobScheduleDataModel = typeof JobScheduleTable.$inferSelect;
export type InsertJobSchedule = z.infer<typeof insertJobScheduleSchema>;
export type SelectJobSchedule = z.infer<typeof selectJobScheduleSchema>;
export type UpdateJobSchedule = z.infer<typeof updateJobScheduleSchema>;
