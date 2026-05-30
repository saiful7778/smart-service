import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
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
import {
  JobAssignmentRoleEnum,
  JobAssignmentStatusEnum,
} from "../../enums/db-enums";
import { OrganizationMemberTable } from "../org";
import { JobTable } from "./job.table";

export const JobAssignmentTable = pgTable(
  "job_assignments",
  {
    id: db_id,
    jobId: uuid("job_id").notNull(),
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
      name: "job_assignment_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_assignment_assignedTo_fkey",
      columns: [table.assignedTo],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_assignment_assignedBy_fkey",
      columns: [table.assignedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("job_assignment_job_id_idx").on(table.jobId),
    index("job_assignment_assignedTo_id_idx").on(table.assignedTo),
    index("job_assignment_assignedBy_id_idx").on(table.assignedBy),
    index("job_assignment_status_idx").on(table.status),
    index("job_assignment_role_idx").on(table.role),
    index("job_assignment_acknowledge_at_idx").on(table.acknowledgeAt),
  ]
);

export const JobAssignmentRelations = relations(
  JobAssignmentTable,
  ({ one }) => ({
    job: one(JobTable, {
      fields: [JobAssignmentTable.jobId],
      references: [JobTable.id],
      relationName: "JobAssignmentToJob",
    }),
    assignedBy: one(OrganizationMemberTable, {
      fields: [JobAssignmentTable.assignedBy],
      references: [OrganizationMemberTable.id],
      relationName: "JobAssignmentToAssignedBy",
    }),
    assignedTo: one(OrganizationMemberTable, {
      fields: [JobAssignmentTable.assignedTo],
      references: [OrganizationMemberTable.id],
      relationName: "JobAssignmentToAssignedTo",
    }),
  })
);

export const insertJobAssignmentSchema = createInsertSchema(
  JobAssignmentTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  acknowledgeAt: true,
});

export const selectJobAssignmentSchema = createSelectSchema(JobAssignmentTable);
export const updateJobAssignmentSchema = createUpdateSchema(
  JobAssignmentTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  acknowledgeAt: true,
});

export type JobAssignmentDataModel = typeof JobAssignmentTable.$inferSelect;
export type InsertJobAssignment = z.infer<typeof insertJobAssignmentSchema>;
export type SelectJobAssignment = z.infer<typeof selectJobAssignmentSchema>;
export type UpdateJobAssignment = z.infer<typeof updateJobAssignmentSchema>;
