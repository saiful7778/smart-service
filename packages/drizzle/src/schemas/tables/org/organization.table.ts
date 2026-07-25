import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { OrgAddressTable } from "../address";
import { CustomerTable } from "../customer";
import { JobTable } from "../job/job.table";
import { JobCategoryTable } from "../job/jobCategory.table";
import { JobScheduleTable } from "../job/jobSchedule.table";
import { LeadCategoryTable, LeadEstimateTable } from "../lead";
import { LeadTable } from "../lead/lead.table";
import { LeadNoteTable } from "../lead/leadNote.table";
import { MaterialTable } from "../material";
import { NotificationTable } from "../notification/notification.table";
import { OrgMemberRoleTable } from "../role-permission";
import { OrgRoleTable } from "../role-permission/orgRole.table";
import { SessionTable } from "../session.table";
import { InvitationTable } from "./invitation.table";
import { OrganizationMemberTable } from "./organizationMember.table";
import { OrgTeamTable } from "./orgTeam.table";

export const OrganizationTable = pgTable(
  "organizations",
  {
    id: db_id,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 255 }),
    logo: text("logo"),
    metadata: text("metadata"),
    updatedAt: db_updated_at,
    createdAt: db_created_at,
  },
  (org) => [
    uniqueIndex("org_slug_key").on(org.slug),
    index("org_created_at_idx").on(org.createdAt),
  ]
);

export const OrganizationRelations = relations(
  OrganizationTable,
  ({ many }) => ({
    roles: many(OrgRoleTable, {
      relationName: "OrgRoleToOrg",
    }),
    members: many(OrganizationMemberTable, {
      relationName: "OrganizationToOrgMember",
    }),
    teams: many(OrgTeamTable, {
      relationName: "OrgTeamToOrganization",
    }),
    memberRoles: many(OrgMemberRoleTable, {
      relationName: "OrgMemberRoleToOrg",
    }),
    invitations: many(InvitationTable, {
      relationName: "OrganizationToInvitation",
    }),
    sessions: many(SessionTable, {
      relationName: "SessionToActiveOrg",
    }),
    addresses: many(OrgAddressTable, {
      relationName: "OrgAddressToOrg",
    }),
    notifications: many(NotificationTable, {
      relationName: "NotificationToOrg",
    }),
    customers: many(CustomerTable, {
      relationName: "CustomerToOrg",
    }),
    leads: many(LeadTable, {
      relationName: "LeadToOrg",
    }),
    jobs: many(JobTable, {
      relationName: "JobToOrg",
    }),
    leadCategories: many(LeadCategoryTable, {
      relationName: "LeadCategoryToOrg",
    }),
    jobCategories: many(JobCategoryTable, {
      relationName: "JobCategoryToOrg",
    }),
    notes: many(LeadNoteTable, {
      relationName: "LeadNoteToOrg",
    }),
    materials: many(MaterialTable, {
      relationName: "MaterialToOrg",
    }),
    jobSchedules: many(JobScheduleTable, {
      relationName: "JobScheduleToOrg",
    }),
    leadEstimates: many(LeadEstimateTable, {
      relationName: "LeadEstimateToOrg",
    }),
  })
);

export const insertOrganizationSchema = createInsertSchema(OrganizationTable, {
  email: z.email(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectOrganizationSchema = createSelectSchema(OrganizationTable);
export const updateOrganizationSchema = createUpdateSchema(OrganizationTable, {
  email: z.email().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OrganizationDataModel = typeof OrganizationTable.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type SelectOrganization = z.infer<typeof selectOrganizationSchema>;
