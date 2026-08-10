import { relations } from "drizzle-orm";
import {
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
import { TaskPriorityEnum, TaskStatusEnum } from "../../enums/db-enums";
import { JobTable } from "../job";
import { OrganizationMemberTable } from "../org";
import { OrganizationTable } from "../org/organization.table";

export const OrgTaskTable = pgTable(
  "org_tasks",
  {
    id: db_id,
    orgId: uuid("org_id").notNull(),
    jobId: uuid("job_id"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: TaskStatusEnum("status").default("todo").notNull(),
    priority: TaskPriorityEnum("priority").default("medium").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true, precision: 3 }),

    assignedBy: uuid("assigned_by"),
    createdBy: uuid("created_by").notNull(),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "org_tasks_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "org_task_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "org_tasks_assigned_by_fkey",
      columns: [table.assignedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "org_tasks_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("org_tasks_org_id_idx").on(table.orgId),
    index("org_tasks_job_schedule_id_idx").on(table.jobId),
    index("org_tasks_assigned_by_idx").on(table.assignedBy),
    index("org_tasks_status_idx").on(table.status),
    index("org_tasks_priority_idx").on(table.priority),
    index("org_tasks_due_date_idx").on(table.dueDate),
    index("org_tasks_created_at_idx").on(table.createdAt),
  ]
);

export const OrgTaskRelations = relations(OrgTaskTable, ({ one }) => ({
  organization: one(OrganizationTable, {
    fields: [OrgTaskTable.orgId],
    references: [OrganizationTable.id],
    relationName: "OrgTaskToOrg",
  }),
  job: one(JobTable, {
    fields: [OrgTaskTable.jobId],
    references: [JobTable.id],
    relationName: "OrgTaskToJob",
  }),
  assignedBy: one(OrganizationMemberTable, {
    fields: [OrgTaskTable.assignedBy],
    references: [OrganizationMemberTable.id],
    relationName: "OrgTaskToAssignedBy",
  }),
  createdBy: one(OrganizationMemberTable, {
    fields: [OrgTaskTable.createdBy],
    references: [OrganizationMemberTable.id],
    relationName: "OrgTaskToCreatedBy",
  }),
}));

export const insertOrgTaskSchema = createInsertSchema(OrgTaskTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectOrgTaskSchema = createSelectSchema(OrgTaskTable);
export const updateOrgTaskSchema = createUpdateSchema(OrgTaskTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OrgTaskDataModel = typeof OrgTaskTable.$inferSelect;
export type InsertOrgTask = z.infer<typeof insertOrgTaskSchema>;
export type SelectOrgTask = z.infer<typeof selectOrgTaskSchema>;
export type UpdateOrgTask = z.infer<typeof updateOrgTaskSchema>;
