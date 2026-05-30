import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  text,
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
import { HistoryEventTypeEnum } from "../../enums/db-enums";
import { JobTable } from "../job/job.table";
import { OrganizationMemberTable } from "../org/organizationMember.table";
import { LeadTable } from "./lead.table";

export const LeadHistoryTable = pgTable(
  "lead_history",
  {
    id: db_id,
    leadId: uuid("lead_id").notNull(),
    jobId: uuid("job_id"),
    eventType: HistoryEventTypeEnum("event_type").notNull(),
    title: varchar("title", { length: 255 }),
    description: text("description"),
    triggeredBy: uuid("triggered_by"),
    triggeredByType: varchar("triggered_by_type", { length: 50 }),
    relatedEntityType: varchar("related_entity_type", { length: 50 }),
    relatedEntityId: uuid("related_entity_id"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "lead_history_lead_fkey",
      columns: [table.leadId],
      foreignColumns: [LeadTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_history_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_history_triggered_by_fkey",
      columns: [table.triggeredBy],
      foreignColumns: [OrganizationMemberTable.id],
    }).onDelete("set null"),
    index("lead_history_lead_id_idx").on(table.leadId),
    index("lead_history_job_id_idx").on(table.jobId),
    index("lead_history_event_type_idx").on(table.eventType),
    index("lead_history_triggered_by_idx").on(table.triggeredBy),
    index("lead_history_created_at_idx").on(table.createdAt),
  ]
);

export const LeadHistoryRelations = relations(LeadHistoryTable, ({ one }) => ({
  lead: one(LeadTable, {
    fields: [LeadHistoryTable.leadId],
    references: [LeadTable.id],
    relationName: "LeadHistoryToLead",
  }),
  job: one(JobTable, {
    fields: [LeadHistoryTable.jobId],
    references: [JobTable.id],
    relationName: "LeadHistoryToJob",
  }),
  triggeredByMember: one(OrganizationMemberTable, {
    fields: [LeadHistoryTable.triggeredBy],
    references: [OrganizationMemberTable.id],
    relationName: "LeadHistoryToTriggeredBy",
  }),
}));

export const insertLeadHistorySchema = createInsertSchema(
  LeadHistoryTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLeadHistorySchema = createSelectSchema(LeadHistoryTable);
export const updateLeadHistorySchema = createUpdateSchema(
  LeadHistoryTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LeadHistoryDataModel = typeof LeadHistoryTable.$inferSelect;
export type InsertLeadHistory = z.infer<typeof insertLeadHistorySchema>;
export type SelectLeadHistory = z.infer<typeof selectLeadHistorySchema>;
export type UpdateLeadHistory = z.infer<typeof updateLeadHistorySchema>;
