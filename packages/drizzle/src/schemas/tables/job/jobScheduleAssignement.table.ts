import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import {
  JobAssignmentRoleEnum,
  JobAssignmentStatusEnum,
} from "../../enums/db-enums";
import { OrganizationMemberTable } from "../org";
import { JobScheduleTable } from "./jobSchedule.table";

export const JobScheduleAssignementTable = pgTable(
  "job_schedule_assignments",
  {
    id: db_id,
    jobScheduleId: uuid("job_schedule_id").notNull(),
    // who assigned
    assignedBy: uuid("assigned_by").notNull(),
    // who is assigned
    assignedTo: uuid("assigned_to").notNull(),
    role: JobAssignmentRoleEnum("role").default("secondary").notNull(),
    status: JobAssignmentStatusEnum("status").default("pending").notNull(),
    acknowledgeAt: timestamp("acknowledge_at", {
      withTimezone: true,
      precision: 3,
    }),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "job_schedule_assignement_schedule_fkey",
      columns: [table.jobScheduleId],
      foreignColumns: [JobScheduleTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_schedule_assignement_assignedTo_fkey",
      columns: [table.assignedTo],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_schedule_assignement_assignedBy_fkey",
      columns: [table.assignedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("job_schedule_assignement_schedule_id_idx").on(table.jobScheduleId),
    index("job_schedule_assignement_assignedTo_idx").on(table.assignedTo),
    index("job_schedule_assignement_assignedBy_idx").on(table.assignedBy),
    index("job_schedule_assignement_status_idx").on(table.status),
    index("job_schedule_assignement_role_idx").on(table.role),
    index("job_schedule_assignement_acknowledgeAt_idx").on(table.acknowledgeAt),
    index("job_schedule_assignement_created_at_idx").on(table.createdAt),
  ]
);

export const JobScheduleAssignementRelations = relations(
  JobScheduleAssignementTable,
  ({ one }) => ({
    jobSchedule: one(JobScheduleTable, {
      fields: [JobScheduleAssignementTable.jobScheduleId],
      references: [JobScheduleTable.id],
      relationName: "JobScheduleAssignementToSchedule",
    }),
    assignedBy: one(OrganizationMemberTable, {
      fields: [JobScheduleAssignementTable.assignedBy],
      references: [OrganizationMemberTable.id],
      relationName: "JobScheduleAssignementToAssignedBy",
    }),
    assignedTo: one(OrganizationMemberTable, {
      fields: [JobScheduleAssignementTable.assignedTo],
      references: [OrganizationMemberTable.id],
      relationName: "JobScheduleAssignementToAssignedTo",
    }),
  })
);

export const insertJobScheduleAssignementSchema = createInsertSchema(
  JobScheduleAssignementTable
).omit({
  id: true,
  createdAt: true,
});
export const selectJobScheduleAssignementSchema = createSelectSchema(
  JobScheduleAssignementTable
);

export type JobScheduleAssignementDataModel =
  typeof JobScheduleAssignementTable.$inferSelect;
export type InsertJobScheduleAssignement = z.infer<
  typeof insertJobScheduleAssignementSchema
>;
export type SelectJobScheduleAssignement = z.infer<
  typeof selectJobScheduleAssignementSchema
>;
