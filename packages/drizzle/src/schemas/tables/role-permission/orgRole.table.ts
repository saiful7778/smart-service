import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
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

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { OrganizationTable } from "../org";
import { OrgRoleMemberTable } from "./orgRoleMember.table";
import { OrgRolePermissionTable } from "./orgRolePermission.table";

export const OrgRoleTable = pgTable(
  "org_roles",
  {
    id: db_id,
    organizationId: uuid("organization_id").notNull(),
    role: varchar("role", { length: 255 }).notNull(),
    permission: text("permission").notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "orgRole_organizationId_fk",
      columns: [table.organizationId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("orgRole_organizationId_idx").on(table.organizationId),
  ]
);

export const OrgRoleRelations = relations(OrgRoleTable, ({ one, many }) => ({
  organization: one(OrganizationTable, {
    relationName: "OrgRoleToOrg",
    fields: [OrgRoleTable.organizationId],
    references: [OrganizationTable.id],
  }),
  permissions: many(OrgRolePermissionTable, {
    relationName: "OrgRolePermissionToOrgRole",
  }),
  members: many(OrgRoleMemberTable, {
    relationName: "OrgRoleMemberToOrgRole",
  }),
}));

export const insertOrgRoleSchema = createInsertSchema(OrgRoleTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectOrgRoleSchema = createSelectSchema(OrgRoleTable);
export const updateOrgRoleSchema = createUpdateSchema(OrgRoleTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OrgRoleDataModel = typeof OrgRoleTable.$inferSelect;
export type InsertOrgRole = z.infer<typeof insertOrgRoleSchema>;
export type SelectOrgRole = z.infer<typeof selectOrgRoleSchema>;
export type UpdateOrgRole = z.infer<typeof updateOrgRoleSchema>;
