import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { OrganizationMemberTable, OrganizationTable } from "../org";
import { RoleTable } from "./role.table";

export const OrgMemberRoleTable = pgTable(
  "org_member_roles",
  {
    id: db_id,
    orgId: uuid("organization_id").notNull(),
    roleId: uuid("role_id").notNull(),
    memberId: uuid("org_member_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "fk_org_member_roles_role_id",
      columns: [table.roleId],
      foreignColumns: [RoleTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "fk_org_member_roles_org_id",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "fk_org_member_roles_member_id",
      columns: [table.memberId],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("org_member_role_unique").on(
      table.orgId,
      table.memberId,
      table.roleId
    ),
    index("org_member_role_org_id_idx").on(table.orgId),
    index("org_member_role_member_id_idx").on(table.memberId),
    index("org_member_role_role_id_idx").on(table.roleId),
  ]
);

export const OrgMemberRoleRelations = relations(
  OrgMemberRoleTable,
  ({ one }) => ({
    role: one(RoleTable, {
      fields: [OrgMemberRoleTable.roleId],
      references: [RoleTable.id],
      relationName: "OrgMemberRoleToRole",
    }),
    org: one(OrganizationTable, {
      fields: [OrgMemberRoleTable.orgId],
      references: [OrganizationTable.id],
      relationName: "OrgMemberRoleToOrg",
    }),
    orgMember: one(OrganizationMemberTable, {
      fields: [OrgMemberRoleTable.memberId],
      references: [OrganizationMemberTable.id],
      relationName: "OrgMemberRoleToOrgMember",
    }),
  })
);

export const insertOrgMemberRoleSchema = createInsertSchema(
  OrgMemberRoleTable
).omit({
  id: true,
  createdAt: true,
});
export const selectOrgMemberRoleSchema = createSelectSchema(OrgMemberRoleTable);

export type OrgMemberRoleDataModel = typeof OrgMemberRoleTable.$inferInsert;
export type InsertOrgMemberRole = z.infer<typeof insertOrgMemberRoleSchema>;
