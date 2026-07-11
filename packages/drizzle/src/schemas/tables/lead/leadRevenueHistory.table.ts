import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  numeric,
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

import { db_id } from "../../../db-utils";
import { LeadRevenueTypeEnum } from "../../enums/db-enums";
import { JobTable } from "../job/job.table";
import { OrganizationMemberTable } from "../org/organizationMember.table";
import { LeadTable } from "./lead.table";

export const LeadRevenueHistoryTable = pgTable(
  "lead_revenue_history",
  {
    id: db_id,
    leadId: uuid("lead_id"),
    jobId: uuid("job_id"),
    revenueType: LeadRevenueTypeEnum("revenue_type").notNull(),
    oldValue: numeric("old_value", { precision: 10, scale: 2 }).default("0"),
    newValue: numeric("new_value", { precision: 10, scale: 2 }).default("0"),
    changedBy: uuid("changed_by").notNull(),
    changedAt: timestamp("changed_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    changeReason: text("change_reason"),
  },
  (table) => [
    foreignKey({
      name: "lead_revenue_history_lead_fkey",
      columns: [table.leadId],
      foreignColumns: [LeadTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_revenue_history_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_revenue_history_changed_by_fkey",
      columns: [table.changedBy],
      foreignColumns: [OrganizationMemberTable.id],
    }).onDelete("set null"),
    index("lead_revenue_history_lead_id_idx").on(table.leadId),
    index("lead_revenue_history_job_id_idx").on(table.jobId),
    index("lead_revenue_history_revenue_type_idx").on(table.revenueType),
    index("lead_revenue_history_changed_by_idx").on(table.changedBy),
    index("lead_revenue_history_changed_at_idx").on(table.changedAt),
  ]
);

export const LeadRevenueHistoryRelations = relations(
  LeadRevenueHistoryTable,
  ({ one }) => ({
    lead: one(LeadTable, {
      fields: [LeadRevenueHistoryTable.leadId],
      references: [LeadTable.id],
      relationName: "LeadRevenueHistoryToLead",
    }),
    job: one(JobTable, {
      fields: [LeadRevenueHistoryTable.jobId],
      references: [JobTable.id],
      relationName: "LeadRevenueHistoryToJob",
    }),
    changedByMember: one(OrganizationMemberTable, {
      fields: [LeadRevenueHistoryTable.changedBy],
      references: [OrganizationMemberTable.id],
      relationName: "LeadRevenueHistoryToChangedBy",
    }),
  })
);

export const insertLeadRevenueHistorySchema = createInsertSchema(
  LeadRevenueHistoryTable
).omit({
  id: true,
  changedAt: true,
});
export const selectLeadRevenueHistorySchema = createSelectSchema(
  LeadRevenueHistoryTable
);
export const updateLeadRevenueHistorySchema = createUpdateSchema(
  LeadRevenueHistoryTable
).omit({
  id: true,
  changedAt: true,
});

export type LeadRevenueHistoryDataModel =
  typeof LeadRevenueHistoryTable.$inferSelect;
export type InsertLeadRevenueHistory = z.infer<
  typeof insertLeadRevenueHistorySchema
>;
export type SelectLeadRevenueHistory = z.infer<
  typeof selectLeadRevenueHistorySchema
>;
export type UpdateLeadRevenueHistory = z.infer<
  typeof updateLeadRevenueHistorySchema
>;
