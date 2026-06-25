import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { OrgRoleTable } from "./orgRole.table";
import { PermissionTable } from "./permission.table";

export const OrgRolePermissionTable = pgTable(
  "org_role_permissions",
  {
    id: db_id,
    roleId: uuid("role_id").notNull(),
    permissionId: uuid("permission_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "orgRolePermission_roleId_fk",
      columns: [table.roleId],
      foreignColumns: [OrgRoleTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("orgRolePermission_roleId_idx").on(table.roleId),
    foreignKey({
      name: "orgRolePermission_permissionId_fk",
      columns: [table.permissionId],
      foreignColumns: [PermissionTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("orgRolePermission_permissionId_idx").on(table.permissionId),
    uniqueIndex("orgRolePermission_unique").on(
      table.roleId,
      table.permissionId
    ),
  ]
);

export const OrgRolePermissionRelations = relations(
  OrgRolePermissionTable,
  ({ one }) => ({
    role: one(OrgRoleTable, {
      relationName: "OrgRolePermissionToOrgRole",
      fields: [OrgRolePermissionTable.roleId],
      references: [OrgRoleTable.id],
    }),
    permission: one(PermissionTable, {
      relationName: "OrgRolePermissionToPermission",
      fields: [OrgRolePermissionTable.permissionId],
      references: [PermissionTable.id],
    }),
  })
);

export const insertOrgRolePermissionSchema = createInsertSchema(
  OrgRolePermissionTable
).omit({
  id: true,
  createdAt: true,
});
export const selectOrgRolePermissionSchema = createSelectSchema(
  OrgRolePermissionTable
);

export type OrgRolePermissionDataModel =
  typeof OrgRolePermissionTable.$inferInsert;
export type SelectOrgRolePermissionType = z.infer<
  typeof selectOrgRolePermissionSchema
>;
export type InsertOrgRolePermissionType = z.infer<
  typeof insertOrgRolePermissionSchema
>;
