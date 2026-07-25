import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  numeric,
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

import {
  db_created_at,
  db_id,
  db_soft_delete,
  db_updated_at,
} from "../../../db-utils";
import { LeadEstimateStatusEnum } from "../../enums/db-enums";
import { JobTable } from "../job/job.table";
import { OrganizationTable } from "../org/organization.table";
import { OrganizationMemberTable } from "../org/organizationMember.table";
import { LeadTable } from "./lead.table";
import { LeadEstimateMaterialTable } from "./leadEstimateMaterial.table";

export const LeadEstimateTable = pgTable(
  "lead_estimates",
  {
    id: db_id,
    orgId: uuid("org_id").notNull(),
    leadId: uuid("lead_id"),
    jobId: uuid("job_id"),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: LeadEstimateStatusEnum("status").default("draft").notNull(),
    discount: numeric("discount", { precision: 12, scale: 2 }).default("0"),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0"),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0"),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true, precision: 3 }),
    notes: text("notes"),
    terms: text("terms"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
    ...db_soft_delete,
  },
  (table) => [
    foreignKey({
      name: "lead_estimate_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_estimate_lead_fkey",
      columns: [table.leadId],
      foreignColumns: [LeadTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_estimate_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_estimate_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_estimate_updated_by_fkey",
      columns: [table.updatedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_estimate_deleted_by_fkey",
      columns: [table.deletedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("lead_estimate_org_id_idx").on(table.orgId),
    index("lead_estimate_lead_id_idx").on(table.leadId),
    index("lead_estimate_job_id_idx").on(table.jobId),
    index("lead_estimate_status_idx").on(table.status),
    index("lead_estimate_created_at_idx").on(table.createdAt),
    index("lead_estimate_created_by_idx").on(table.createdBy),
    index("lead_estimate_deleted_by_idx").on(table.deletedBy),
    index("lead_estimate_deleted_at_idx").on(table.deletedAt),
  ]
);

export const LeadEstimateRelations = relations(
  LeadEstimateTable,
  ({ one, many }) => ({
    org: one(OrganizationTable, {
      fields: [LeadEstimateTable.orgId],
      references: [OrganizationTable.id],
      relationName: "LeadEstimateToOrg",
    }),
    lead: one(LeadTable, {
      fields: [LeadEstimateTable.leadId],
      references: [LeadTable.id],
      relationName: "LeadEstimateToLead",
    }),
    job: one(JobTable, {
      fields: [LeadEstimateTable.jobId],
      references: [JobTable.id],
      relationName: "LeadEstimateToJob",
    }),
    createdByMember: one(OrganizationMemberTable, {
      fields: [LeadEstimateTable.createdBy],
      references: [OrganizationMemberTable.id],
      relationName: "LeadEstimateToCreatedBy",
    }),
    updatedByMember: one(OrganizationMemberTable, {
      fields: [LeadEstimateTable.updatedBy],
      references: [OrganizationMemberTable.id],
      relationName: "LeadEstimateToUpdatedBy",
    }),
    deletedByMember: one(OrganizationMemberTable, {
      fields: [LeadEstimateTable.deletedBy],
      references: [OrganizationMemberTable.id],
      relationName: "LeadEstimateToDeletedBy",
    }),
    materials: many(LeadEstimateMaterialTable, {
      relationName: "LeadEstimateMaterialToEstimate",
    }),
  })
);

export const insertLeadEstimateSchema = createInsertSchema(
  LeadEstimateTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLeadEstimateSchema = createSelectSchema(LeadEstimateTable);
export const updateLeadEstimateSchema = createUpdateSchema(
  LeadEstimateTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LeadEstimateDataModel = typeof LeadEstimateTable.$inferSelect;
export type InsertLeadEstimate = z.infer<typeof insertLeadEstimateSchema>;
export type SelectLeadEstimate = z.infer<typeof selectLeadEstimateSchema>;
export type UpdateLeadEstimate = z.infer<typeof updateLeadEstimateSchema>;
