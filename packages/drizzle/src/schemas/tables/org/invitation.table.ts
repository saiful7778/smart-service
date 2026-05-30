import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { foreignKey } from "drizzle-orm/pg-core";
import { uniqueIndex } from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { UserTable } from "../user";
import { OrganizationTable } from "./organization.table";
import { OrgTeamTable } from "./orgTeam.table";

export const InvitationTable = pgTable(
  "invitations",
  {
    id: db_id,
    email: varchar("email", { length: 255 }).notNull(),
    inviterId: uuid("user_id").notNull(),
    organizationId: uuid("organization_id").notNull(),
    teamId: uuid("team_id"),
    role: varchar("role", { length: 255 }).notNull(),
    status: varchar("status", { length: 255 }).notNull(),
    createdAt: db_created_at,
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      precision: 3,
    })
      .notNull()
      .defaultNow(),
  },
  (invitation) => [
    foreignKey({
      name: "invitation_inviter_fkey",
      columns: [invitation.inviterId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "invitation_org_fkey",
      columns: [invitation.organizationId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "invitation_team_fkey",
      columns: [invitation.teamId],
      foreignColumns: [OrgTeamTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("invitation_email_org_key").on(
      invitation.email,
      invitation.organizationId
    ),
    index("invitation_org_id_idx").on(invitation.organizationId),
    index("invitation_inviter_id_idx").on(invitation.inviterId),
  ]
);

export const InvitationRelations = relations(InvitationTable, ({ one }) => ({
  inviter: one(UserTable, {
    fields: [InvitationTable.inviterId],
    references: [UserTable.id],
    relationName: "UserToOrgInvitation",
  }),
  organization: one(OrganizationTable, {
    fields: [InvitationTable.organizationId],
    references: [OrganizationTable.id],
    relationName: "OrgToInvitation",
  }),
  team: one(OrgTeamTable, {
    fields: [InvitationTable.teamId],
    references: [OrgTeamTable.id],
    relationName: "TeamToInvitation",
  }),
}));

export const insertInvitationSchema = createInsertSchema(InvitationTable, {
  email: z.email(),
}).omit({
  id: true,
  createdAt: true,
});
export const selectInvitationSchema = createSelectSchema(InvitationTable);
export const updateInvitationSchema = createUpdateSchema(InvitationTable, {
  email: z.email().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export type InvitationDataModel = typeof InvitationTable.$inferSelect;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type SelectInvitation = z.infer<typeof selectInvitationSchema>;
