import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { uniqueIndex } from "drizzle-orm/pg-core";
import { foreignKey } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { CustomerTable } from "../customer";
import { JobMaterialTable, JobTable } from "../job";
import { JobAssignmentTable } from "../job/jobAssignment.table";
import { JobCategoryTable } from "../job/jobCategory.table";
import { ScheduleAssignementTable } from "../job/scheduleAssignement.table";
import { TimeEntryTable } from "../job/timeEntry.table";
import { LeadCategoryTable } from "../lead";
import { LeadTable } from "../lead/lead.table";
import { LeadAttachmentTable } from "../lead/leadAttachment.table";
import { LeadHistoryTable } from "../lead/leadHistory.table";
import { LeadNoteTable } from "../lead/leadNote.table";
import { LeadRevenueHistoryTable } from "../lead/leadRevenueHistory.table";
import { MaterialTable } from "../material";
import { OrgMemberRoleTable } from "../role-permission";
import { UserTable } from "../user";
import { OrganizationTable } from "./organization.table";

export const OrganizationMemberTable = pgTable(
  "organization_members",
  {
    id: db_id,
    userId: uuid("user_id").notNull(),
    organizationId: uuid("organization_id").notNull(),
    role: varchar("role", { length: 255 }).notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (member) => [
    foreignKey({
      name: "orgMember_user_fkey",
      columns: [member.userId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "orgMember_org_fkey",
      columns: [member.organizationId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("orgMember_user_org_id_key").on(
      member.userId,
      member.organizationId
    ),
    index("orgMember_user_id_idx").on(member.userId),
    index("orgMember_org_id_idx").on(member.organizationId),
    index("orgMember_created_at_idx").on(member.createdAt),
  ]
);

export const OrganizationMemberRelations = relations(
  OrganizationMemberTable,
  ({ one, many }) => ({
    user: one(UserTable, {
      fields: [OrganizationMemberTable.userId],
      references: [UserTable.id],
      relationName: "UserToOrgMember",
    }),
    organization: one(OrganizationTable, {
      fields: [OrganizationMemberTable.organizationId],
      references: [OrganizationTable.id],
      relationName: "OrganizationToOrgMember",
    }),
    roles: many(OrgMemberRoleTable, {
      relationName: "OrgMemberRoleToOrgMember",
    }),

    createdMaterials: many(MaterialTable, {
      relationName: "MaterialToCreatedBy",
    }),
    updatedMaterials: many(MaterialTable, {
      relationName: "MaterialToUpdatedBy",
    }),
    deletedMaterials: many(MaterialTable, {
      relationName: "MaterialToDeletedBy",
    }),

    createdCustomers: many(CustomerTable, {
      relationName: "CustomerToCreatedBy",
    }),
    updatedCustomers: many(CustomerTable, {
      relationName: "CustomerToUpdatedBy",
    }),
    deletedCustomers: many(CustomerTable, {
      relationName: "CustomerToDeletedBy",
    }),

    createdLeads: many(LeadTable, {
      relationName: "LeadToCreatedBy",
    }),
    updatedLeads: many(LeadTable, {
      relationName: "LeadToUpdatedBy",
    }),
    deletedLeads: many(LeadTable, {
      relationName: "LeadToDeletedBy",
    }),

    uploadedLeadAttachments: many(LeadAttachmentTable, {
      relationName: "LeadAttachmentToUploadedBy",
    }),
    deletedLeadAttachments: many(LeadAttachmentTable, {
      relationName: "LeadAttachmentToDeletedBy",
    }),

    leadRevenueChanges: many(LeadRevenueHistoryTable, {
      relationName: "LeadRevenueHistoryToChangedBy",
    }),
    leadCategories: many(LeadCategoryTable, {
      relationName: "LeadCategoryToCreatedBy",
    }),
    leadHistories: many(LeadHistoryTable, {
      relationName: "LeadHistoryToTriggeredBy",
    }),
    leadNotes: many(LeadNoteTable, {
      relationName: "LeadNoteToCreatedBy",
    }),

    createdJobs: many(JobTable, {
      relationName: "JobToCreatedBy",
    }),
    updatedJobs: many(JobTable, {
      relationName: "JobToUpdatedBy",
    }),
    deletedJobs: many(JobTable, {
      relationName: "JobToDeletedBy",
    }),

    assignedBys: many(JobAssignmentTable, {
      relationName: "JobAssignmentToAssignedBy",
    }),
    assignedAts: many(JobAssignmentTable, {
      relationName: "JobAssignmentToAssignedAt",
    }),
    jobCategories: many(JobCategoryTable, {
      relationName: "JobCategoryToCreatedBy",
    }),
    createdJobMaterials: many(JobMaterialTable, {
      relationName: "JobMaterialToCreatedBy",
    }),
    updatedJobMaterials: many(JobMaterialTable, {
      relationName: "JobMaterialToUpdatedBy",
    }),

    scheduleAssignments: many(ScheduleAssignementTable, {
      relationName: "ScheduleAssignementToOrgMember",
    }),
    timeEntries: many(TimeEntryTable, {
      relationName: "TimeEntryToMember",
    }),
  })
);

export const insertOrgMemberSchema = createInsertSchema(
  OrganizationMemberTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectOrgMemberSchema = createSelectSchema(
  OrganizationMemberTable
);
export const updateOrgMemberSchema = createUpdateSchema(
  OrganizationMemberTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OrgMemberDataModel = typeof OrganizationMemberTable.$inferSelect;
export type InsertOrgMember = z.infer<typeof insertOrgMemberSchema>;
export type SelectOrgMember = z.infer<typeof selectOrgMemberSchema>;
export type UpdateOrgMember = z.infer<typeof updateOrgMemberSchema>;
