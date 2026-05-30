import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { OrganizationTable } from "./organization.table";
import { OrgTeamMemberTable } from "./orgTeamMember.table";

export const OrgTeamTable = pgTable(
  "org_teams",
  {
    id: db_id,
    name: varchar("name", { length: 255 }).notNull(),
    organizationId: uuid("organization_id").notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "orgTeam_org_fkey",
      columns: [table.organizationId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("orgTeam_org_id_idx").on(table.organizationId),
    index("orgTeam_created_at_idx").on(table.createdAt),
  ]
);

export const OrgTeamRelations = relations(OrgTeamTable, ({ one, many }) => ({
  organization: one(OrganizationTable, {
    fields: [OrgTeamTable.organizationId],
    references: [OrganizationTable.id],
    relationName: "OrgTeamToOrganization",
  }),
  teamMembers: many(OrgTeamMemberTable, {
    relationName: "OrgTeamMemberToTeam",
  }),
}));

export const insertOrgTeamSchema = createInsertSchema(OrgTeamTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectOrgTeamSchema = createSelectSchema(OrgTeamTable);
export const updateOrgTeamSchema = createUpdateSchema(OrgTeamTable);

export type OrgTeamDataModel = typeof OrgTeamTable.$inferSelect;
export type InsertOrgTeam = z.infer<typeof insertOrgTeamSchema>;
export type SelectOrgTeam = z.infer<typeof selectOrgTeamSchema>;
export type UpdateOrgTeam = z.infer<typeof updateOrgTeamSchema>;
