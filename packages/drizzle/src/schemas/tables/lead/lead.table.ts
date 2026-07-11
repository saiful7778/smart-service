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

import {
  db_created_at,
  db_id,
  db_soft_delete,
  db_updated_at,
} from "../../../db-utils";
import { LeadSourceEnum, LeadStatusEnum } from "../../enums/db-enums";
import { LeadAddressTable } from "../address";
import { CustomerTable } from "../customer";
import { JobTable } from "../job";
import { OrganizationMemberTable, OrganizationTable } from "../org";
import { LeadAttachmentTable } from "./leadAttachment.table";
import { LeadCategoryJoinTable } from "./leadCategoryJoin.table";
import { LeadNoteTable } from "./leadNote.table";
import { LeadRevenueHistoryTable } from "./leadRevenueHistory.table";

export const LeadTable = pgTable(
  "leads",
  {
    id: db_id,
    orgId: uuid("organization_id").notNull(),
    customerId: uuid("customer_id"),
    status: LeadStatusEnum("status").default("new").notNull(),
    source: LeadSourceEnum("source").notNull(),
    serviceType: varchar("service_type", { length: 255 }),
    description: text("description"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
    ...db_soft_delete,
  },
  (table) => [
    foreignKey({
      name: "leads_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "leads_customer_fkey",
      columns: [table.customerId],
      foreignColumns: [CustomerTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "leads_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "leads_updated_by_fkey",
      columns: [table.updatedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "leads_deleted_by_fkey",
      columns: [table.deletedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("leads_org_id_idx").on(table.orgId),
    index("leads_customer_id_idx").on(table.customerId),
    index("leads_status_idx").on(table.status),
    index("leads_created_at_idx").on(table.createdAt),
    index("leads_created_by_idx").on(table.createdBy),
    index("leads_updated_by_idx").on(table.updatedBy),
    index("leads_deleted_by_idx").on(table.deletedBy),
    index("leads_deleted_at_idx").on(table.deletedAt),
  ]
);

export const LeadRelations = relations(LeadTable, ({ one, many }) => ({
  organization: one(OrganizationTable, {
    fields: [LeadTable.orgId],
    references: [OrganizationTable.id],
    relationName: "LeadToOrg",
  }),
  customer: one(CustomerTable, {
    fields: [LeadTable.customerId],
    references: [CustomerTable.id],
    relationName: "LeadToCustomer",
  }),

  createdByMember: one(OrganizationMemberTable, {
    fields: [LeadTable.createdBy],
    references: [OrganizationMemberTable.id],
    relationName: "LeadToCreatedBy",
  }),
  updatedByMember: one(OrganizationMemberTable, {
    fields: [LeadTable.updatedBy],
    references: [OrganizationMemberTable.id],
    relationName: "LeadToUpdatedBy",
  }),
  deletedByMember: one(OrganizationMemberTable, {
    fields: [LeadTable.deletedBy],
    references: [OrganizationMemberTable.id],
    relationName: "LeadToDeletedBy",
  }),

  addresses: many(LeadAddressTable, {
    relationName: "LeadAddressToLead",
  }),
  notes: many(LeadNoteTable, {
    relationName: "LeadNoteToLead",
  }),
  revenueHistory: many(LeadRevenueHistoryTable, {
    relationName: "LeadRevenueHistoryToLead",
  }),
  categories: many(LeadCategoryJoinTable, {
    relationName: "LeadCategoryJoinToLead",
  }),
  attachments: many(LeadAttachmentTable, {
    relationName: "LeadAttachmentToLead",
  }),
  jobs: many(JobTable, {
    relationName: "JobToLead",
  }),
}));

export const insertLeadSchema = createInsertSchema(LeadTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLeadSchema = createSelectSchema(LeadTable);
export const updateLeadSchema = createUpdateSchema(LeadTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LeadDataModel = typeof LeadTable.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type SelectLead = z.infer<typeof selectLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
