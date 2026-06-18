import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  jsonb,
  pgTable,
  uniqueIndex,
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
import { RoleEnum, RoleTypeEnum } from "../../enums/db-enums";
import { OrganizationTable } from "../org";
import { OrgMemberRoleTable } from "./orgMemberRole.table";
import { RolePermissionTable } from "./rolePermission.table";
import { UserRoleTable } from "./userRole.table";

export const RoleTable = pgTable(
  "roles",
  {
    id: db_id,
    orgId: uuid("org_id"),
    type: RoleTypeEnum("type").notNull().default("SYSTEM"),
    roleName: RoleEnum("role_name").notNull().default("USER"),
    customRoleName: varchar("custom_role_name", { length: 255 }),
    description: varchar("description", { length: 255 }),
    metadata: jsonb("metadata"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "role_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("role_org_id_idx").on(table.orgId),
    index("role_type_idx").on(table.type),
    index("role_name_idx").on(table.roleName),
    index("role_custom_role_name_idx").on(table.customRoleName),
    uniqueIndex("role_org_id_custom_role_name_unique_idx").on(
      table.orgId,
      table.customRoleName
    ),
  ]
);

export const RoleRelations = relations(RoleTable, ({ many, one }) => ({
  org: one(OrganizationTable, {
    fields: [RoleTable.orgId],
    references: [OrganizationTable.id],
    relationName: "RoleToOrg",
  }),
  rolePermissions: many(RolePermissionTable, {
    relationName: "RoleToRolePermission",
  }),
  userRoles: many(UserRoleTable, {
    relationName: "UserRoleToRole",
  }),
  orgRoles: many(OrgMemberRoleTable, {
    relationName: "OrgMemberRoleToRole",
  }),
}));

export const insertRoleSchema = createInsertSchema(RoleTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectRoleSchema = createSelectSchema(RoleTable);
export const updateRoleSchema = createUpdateSchema(RoleTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RoleDataModel = typeof RoleTable.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type SelectRole = z.infer<typeof selectRoleSchema>;
export type UpdateRole = z.infer<typeof updateRoleSchema>;
