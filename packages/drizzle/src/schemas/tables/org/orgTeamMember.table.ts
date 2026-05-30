import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { UserTable } from "../user";
import { OrgTeamTable } from "./orgTeam.table";

export const OrgTeamMemberTable = pgTable(
  "org_team_members",
  {
    id: db_id,
    teamId: uuid("team_id").notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "orgTeamMember_team_fkey",
      columns: [table.teamId],
      foreignColumns: [OrgTeamTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "orgTeamMember_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("orgTeamMember_team_id_idx").on(table.teamId),
    index("orgTeamMember_user_id_idx").on(table.userId),
    index("orgTeamMember_created_at_idx").on(table.createdAt),
  ]
);

export const OrgTeamMemberRelations = relations(
  OrgTeamMemberTable,
  ({ one }) => ({
    team: one(OrgTeamTable, {
      fields: [OrgTeamMemberTable.teamId],
      references: [OrgTeamTable.id],
      relationName: "OrgTeamMemberToTeam",
    }),
    user: one(UserTable, {
      fields: [OrgTeamMemberTable.userId],
      references: [UserTable.id],
      relationName: "OrgTeamMemberToUser",
    }),
  })
);

export const insertOrgTeamMemberSchema = createInsertSchema(
  OrgTeamMemberTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectOrgTeamMemberSchema = createSelectSchema(OrgTeamMemberTable);
export const updateOrgTeamMemberSchema = createUpdateSchema(
  OrgTeamMemberTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OrgTeamMemberDataModel = typeof OrgTeamMemberTable.$inferSelect;
export type InsertOrgTeamMember = z.infer<typeof insertOrgTeamMemberSchema>;
export type SelectOrgTeamMember = z.infer<typeof selectOrgTeamMemberSchema>;
export type UpdateOrgTeamMember = z.infer<typeof updateOrgTeamMemberSchema>;
