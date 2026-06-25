// Join table between OrgRole and OrganizationMember
import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { OrganizationMemberTable } from "../org/organizationMember.table";
import { OrgRoleTable } from "./orgRole.table";

export const OrgRoleMemberTable = pgTable(
  "org_role_members",
  {
    id: db_id,
    roleId: uuid("role_id").notNull(),
    memberId: uuid("member_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "org_role_member_org_role_id_fkey",
      columns: [table.roleId],
      foreignColumns: [OrgRoleTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "org_role_member_org_member_id_fkey",
      columns: [table.memberId],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("org_role_member_org_role_id_idx").on(table.roleId),
    index("org_role_member_org_member_id_idx").on(table.memberId),
    index("org_role_member_unique_idx").on(table.roleId, table.memberId),
  ]
);

export const OrgRoleMemberRelations = relations(
  OrgRoleMemberTable,
  ({ one }) => ({
    orgRole: one(OrgRoleTable, {
      fields: [OrgRoleMemberTable.roleId],
      references: [OrgRoleTable.id],
      relationName: "OrgRoleMemberToOrgRole",
    }),
    orgMember: one(OrganizationMemberTable, {
      fields: [OrgRoleMemberTable.memberId],
      references: [OrganizationMemberTable.id],
      relationName: "OrgRoleMemberToOrgMember",
    }),
  })
);

export const insertOrgRoleMemberSchema = createInsertSchema(
  OrgRoleMemberTable
).omit({
  id: true,
  createdAt: true,
});
export const selectOrgRoleMemberSchema = createSelectSchema(OrgRoleMemberTable);

export type OrgRoleMemberDataModel = typeof OrgRoleMemberTable.$inferSelect;
export type InsertOrgRoleMember = z.infer<typeof insertOrgRoleMemberSchema>;
export type SelectOrgRoleMember = z.infer<typeof selectOrgRoleMemberSchema>;
