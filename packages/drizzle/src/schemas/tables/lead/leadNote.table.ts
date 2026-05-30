import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { JobTable } from "../job/job.table";
import { OrganizationTable } from "../org/organization.table";
import { OrganizationMemberTable } from "../org/organizationMember.table";
import { LeadTable } from "./lead.table";

export const LeadNoteTable = pgTable(
  "lead_notes",
  {
    id: db_id,
    orgId: uuid("organization_id").notNull(),
    leadId: uuid("lead_id").notNull(),
    jobId: uuid("job_id"),
    content: text("content").notNull(),
    createdBy: uuid("created_by").notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "notes_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "notes_lead_fkey",
      columns: [table.leadId],
      foreignColumns: [LeadTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "notes_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "notes_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("notes_org_id_idx").on(table.orgId),
    index("notes_lead_id_idx").on(table.leadId),
    index("notes_job_id_idx").on(table.jobId),
    index("notes_created_by_idx").on(table.createdBy),
  ]
);

export const LeadNoteRelations = relations(LeadNoteTable, ({ one }) => ({
  organization: one(OrganizationTable, {
    fields: [LeadNoteTable.orgId],
    references: [OrganizationTable.id],
    relationName: "LeadNoteToOrg",
  }),
  lead: one(LeadTable, {
    fields: [LeadNoteTable.leadId],
    references: [LeadTable.id],
    relationName: "LeadNoteToLead",
  }),
  job: one(JobTable, {
    fields: [LeadNoteTable.jobId],
    references: [JobTable.id],
    relationName: "LeadNoteToJob",
  }),
  createdByMember: one(OrganizationMemberTable, {
    fields: [LeadNoteTable.createdBy],
    references: [OrganizationMemberTable.id],
    relationName: "LeadNoteToCreatedBy",
  }),
}));

export const insertLeadNoteSchema = createInsertSchema(LeadNoteTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLeadNoteSchema = createSelectSchema(LeadNoteTable);
export const updateLeadNoteSchema = createUpdateSchema(LeadNoteTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LeadNoteDataModel = typeof LeadNoteTable.$inferSelect;
export type InsertLeadNote = z.infer<typeof insertLeadNoteSchema>;
export type SelectLeadNote = z.infer<typeof selectLeadNoteSchema>;
export type UpdateLeadNote = z.infer<typeof updateLeadNoteSchema>;
