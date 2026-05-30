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

import { db_id, db_soft_delete } from "../../../db-utils";
import { FileTable } from "../file.table";
import { JobTable } from "../job/job.table";
import { OrganizationMemberTable } from "../org/organizationMember.table";
import { LeadTable } from "./lead.table";

export const LeadAttachmentTable = pgTable(
  "lead_attachments",
  {
    id: db_id,
    leadId: uuid("lead_id").notNull(),
    jobId: uuid("job_id"),
    fileId: uuid("file_id").notNull(),
    title: varchar("title", { length: 255 }),
    description: text("description"),
    category: varchar("category", { length: 255 }),
    uploadedBy: uuid("uploaded_by").notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    ...db_soft_delete,
  },
  (table) => [
    foreignKey({
      name: "lead_attachment_lead_fkey",
      columns: [table.leadId],
      foreignColumns: [LeadTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_attachment_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_attachment_file_fkey",
      columns: [table.fileId],
      foreignColumns: [FileTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_attachment_uploaded_by_fkey",
      columns: [table.uploadedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_attachment_deleted_by_fkey",
      columns: [table.deletedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("lead_attachment_lead_id_idx").on(table.leadId),
    index("lead_attachment_job_id_idx").on(table.jobId),
    index("lead_attachment_file_id_idx").on(table.fileId),
    index("lead_attachment_uploaded_at_idx").on(table.uploadedAt),
    index("lead_attachment_uploaded_by_idx").on(table.uploadedBy),
    index("lead_attachment_deleted_by_idx").on(table.deletedBy),
    index("lead_attachment_deleted_at_idx").on(table.deletedAt),
  ]
);

export const LeadAttachmentRelations = relations(
  LeadAttachmentTable,
  ({ one }) => ({
    lead: one(LeadTable, {
      fields: [LeadAttachmentTable.leadId],
      references: [LeadTable.id],
      relationName: "LeadAttachmentToLead",
    }),
    job: one(JobTable, {
      fields: [LeadAttachmentTable.jobId],
      references: [JobTable.id],
      relationName: "LeadAttachmentToJob",
    }),
    file: one(FileTable, {
      fields: [LeadAttachmentTable.fileId],
      references: [FileTable.id],
      relationName: "FileToLeadAttachment",
    }),
    uploadedByMember: one(OrganizationMemberTable, {
      fields: [LeadAttachmentTable.uploadedBy],
      references: [OrganizationMemberTable.id],
      relationName: "LeadAttachmentToUploadedBy",
    }),
    deletedByMember: one(OrganizationMemberTable, {
      fields: [LeadAttachmentTable.deletedBy],
      references: [OrganizationMemberTable.id],
      relationName: "LeadAttachmentToDeletedBy",
    }),
  })
);

export const insertLeadAttachmentSchema = createInsertSchema(
  LeadAttachmentTable
).omit({
  id: true,
  uploadedAt: true,
});
export const selectLeadAttachmentSchema =
  createSelectSchema(LeadAttachmentTable);
export const updateLeadAttachmentSchema = createUpdateSchema(
  LeadAttachmentTable
).omit({
  id: true,
  uploadedAt: true,
});

export type LeadAttachmentDataModel = typeof LeadAttachmentTable.$inferSelect;
export type InsertLeadAttachment = z.infer<typeof insertLeadAttachmentSchema>;
export type SelectLeadAttachment = z.infer<typeof selectLeadAttachmentSchema>;
export type UpdateLeadAttachment = z.infer<typeof updateLeadAttachmentSchema>;
