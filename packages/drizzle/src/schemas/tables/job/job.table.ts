import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  numeric,
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
import { JobStatusEnum } from "../../enums/db-enums";
import { JobAddressTable } from "../address/jobAddress.table";
import { CustomerTable } from "../customer";
import {
  LeadAttachmentTable,
  LeadEstimateTable,
  LeadNoteTable,
  LeadRevenueHistoryTable,
  LeadTable,
} from "../lead";
import { OrganizationMemberTable, OrganizationTable } from "../org";
import { JobCategoryJoinTable } from "./jobCategoryJoin.table";
import { JobMaterialTable } from "./jobMaterial.table";
import { JobScheduleTable } from "./jobSchedule.table";
import { JobTimeEntryTable } from "./jobTimeEntry.table";

export const JobTable = pgTable(
  "jobs",
  {
    id: db_id,
    orgId: uuid("organization_id").notNull(),
    customerId: uuid("customer_id"),
    leadId: uuid("lead_id"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: JobStatusEnum("status").default("scheduled").notNull(),
    expectedRevenue: numeric("expected_revenue", {
      precision: 10,
      scale: 2,
    }).default("0"),
    invoicedRevenue: numeric("invoiced_revenue", {
      precision: 10,
      scale: 2,
    }).default("0"),
    receivedRevenue: numeric("received_revenue", {
      precision: 10,
      scale: 2,
    }).default("0"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
    ...db_soft_delete,
  },
  (table) => [
    foreignKey({
      name: "jobs_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "jobs_customer_fkey",
      columns: [table.customerId],
      foreignColumns: [CustomerTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "jobs_lead_fkey",
      columns: [table.leadId],
      foreignColumns: [LeadTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "jobs_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "jobs_updated_by_fkey",
      columns: [table.updatedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "jobs_deleted_by_fkey",
      columns: [table.deletedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("jobs_org_id_idx").on(table.orgId),
    index("jobs_lead_id_idx").on(table.leadId),
    index("jobs_customer_id_idx").on(table.customerId),
    index("jobs_status_idx").on(table.status),
    index("jobs_created_at_idx").on(table.createdAt),
    index("jobs_created_by_idx").on(table.createdBy),
    index("jobs_updated_by_idx").on(table.updatedBy),
    index("jobs_deleted_by_idx").on(table.deletedBy),
    index("jobs_deleted_at_idx").on(table.deletedAt),
  ]
);

export const JobRelations = relations(JobTable, ({ one, many }) => ({
  organization: one(OrganizationTable, {
    fields: [JobTable.orgId],
    references: [OrganizationTable.id],
    relationName: "JobToOrg",
  }),
  customer: one(CustomerTable, {
    fields: [JobTable.customerId],
    references: [CustomerTable.id],
    relationName: "JobToCustomer",
  }),
  lead: one(LeadTable, {
    fields: [JobTable.leadId],
    references: [LeadTable.id],
    relationName: "JobToLead",
  }),
  createdByMember: one(OrganizationMemberTable, {
    fields: [JobTable.createdBy],
    references: [OrganizationMemberTable.id],
    relationName: "JobToCreatedBy",
  }),
  updatedByMember: one(OrganizationMemberTable, {
    fields: [JobTable.updatedBy],
    references: [OrganizationMemberTable.id],
    relationName: "JobToUpdatedBy",
  }),
  deletedByMember: one(OrganizationMemberTable, {
    fields: [JobTable.deletedBy],
    references: [OrganizationMemberTable.id],
    relationName: "JobToDeletedBy",
  }),
  attachments: many(LeadAttachmentTable, {
    relationName: "LeadAttachmentToJob",
  }),
  revenueHistory: many(LeadRevenueHistoryTable, {
    relationName: "LeadRevenueHistoryToJob",
  }),
  addresses: many(JobAddressTable, {
    relationName: "JobAddressToJob",
  }),
  notes: many(LeadNoteTable, {
    relationName: "LeadNoteToJob",
  }),
  jobMaterials: many(JobMaterialTable, {
    relationName: "JobMaterialToJob",
  }),
  categories: many(JobCategoryJoinTable, {
    relationName: "JobCategoryJoinToJob",
  }),
  jobSchedules: many(JobScheduleTable, {
    relationName: "JobScheduleToJob",
  }),
  timeEntries: many(JobTimeEntryTable, {
    relationName: "JobTimeEntryToJob",
  }),
  leadEstimates: many(LeadEstimateTable, { relationName: "LeadEstimateToJob" }),
}));

export const insertJobSchema = createInsertSchema(JobTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectJobSchema = createSelectSchema(JobTable);
export const updateJobSchema = createUpdateSchema(JobTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type JobDataModel = typeof JobTable.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type SelectJob = z.infer<typeof selectJobSchema>;
export type UpdateJob = z.infer<typeof updateJobSchema>;
