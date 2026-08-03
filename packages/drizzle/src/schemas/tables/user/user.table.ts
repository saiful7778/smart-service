import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
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
import { AccountTable } from "../account.table";
import { AddressTable, UserAddressTable } from "../address";
import { ContactSubmissionReplyTable } from "../contact";
import { FeedbackIssueReplyTable, FeedbackIssueTable } from "../feedback";
import { FileTable } from "../file.table";
import {
  NotificationSettingsTable,
  NotificationTable,
  PushSubscriptionTable,
} from "../notification";
import { OrganizationMemberTable } from "../org";
import { OrgTeamMemberTable } from "../org/orgTeamMember.table";
import { UserRoleTable } from "../role-permission";
import { SessionTable } from "../session.table";
import { UserSettingsTable } from "./userSettings.table";

export const UserTable = pgTable(
  "users",
  {
    id: db_id,
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: varchar("image", { length: 255 }),
    role: varchar("role", { length: 255 }),
    banned: boolean("banned").default(false),
    banReason: varchar("ban_reason", { length: 255 }),
    banExpires: timestamp("ban_expires", { withTimezone: true, precision: 3 }),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [uniqueIndex("user_email_key").on(table.email)]
);

export const UserRelations = relations(UserTable, ({ one, many }) => ({
  sessions: many(SessionTable, {
    relationName: "SessionToUser",
  }),
  accounts: many(AccountTable, {
    relationName: "AccountToUser",
  }),
  settings: one(UserSettingsTable, {
    fields: [UserTable.id],
    references: [UserSettingsTable.userId],
    relationName: "UserSettingsToUser",
  }),
  addresses: many(UserAddressTable, {
    relationName: "UserAddressToUser",
  }),
  deletedAddresses: many(AddressTable, {
    relationName: "AddressDeletedBy",
  }),
  contactReplies: many(ContactSubmissionReplyTable, {
    relationName: "ContactSubmissionReplyToUser",
  }),
  uploadedFiles: many(FileTable, {
    relationName: "FileUploadedBy",
  }),
  deletedFiles: many(FileTable, {
    relationName: "FileDeletedBy",
  }),
  orgMembers: many(OrganizationMemberTable, {
    relationName: "UserToOrgMember",
  }),
  orgTeams: many(OrgTeamMemberTable, {
    relationName: "OrgTeamMemberToUser",
  }),
  roles: many(UserRoleTable, {
    relationName: "UserToUserRole",
  }),
  // notification
  notifications: many(NotificationTable, {
    relationName: "NotificationToRecipient",
  }),
  sentNotifications: many(NotificationTable, {
    relationName: "NotificationToActor",
  }),
  notificationSettings: many(NotificationSettingsTable, {
    relationName: "NotificationSettingToUser",
  }),
  pushSubscriptions: many(PushSubscriptionTable, {
    relationName: "PushSubscriptionToUser",
  }),
  feedbackIssues: many(FeedbackIssueTable, {
    relationName: "FeedbackIssueToCreatedBy",
  }),
  feedbackIssueReplies: many(FeedbackIssueReplyTable, {
    relationName: "FeedbackIssueReplyToCreatedBy",
  }),
}));

export const insertUserSchema = createInsertSchema(UserTable, {
  email: z.email(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectUserSchema = createSelectSchema(UserTable);
export const updateUserSchema = createUpdateSchema(UserTable, {
  email: z.email().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserDataModel = typeof UserTable.$inferSelect;
export type SelectUser = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
