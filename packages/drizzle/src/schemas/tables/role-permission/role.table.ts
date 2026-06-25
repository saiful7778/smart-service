import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
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
import { RoleEnum, RoleTypeEnum } from "../../enums/db-enums";
import { OrgMemberRoleTable } from "./orgMemberRole.table";
import { RolePermissionTable } from "./rolePermission.table";
import { UserRoleTable } from "./userRole.table";

export const RoleTable = pgTable(
  "roles",
  {
    id: db_id,
    type: RoleTypeEnum("type").notNull().default("SYSTEM"),
    roleName: RoleEnum("role_name").notNull().default("USER"),
    description: varchar("description", { length: 255 }),
    metadata: jsonb("metadata"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    index("role_type_idx").on(table.type),
    index("role_name_idx").on(table.roleName),
    uniqueIndex("role_type_name_unique").on(table.type, table.roleName),
  ]
);

export const RoleRelations = relations(RoleTable, ({ many }) => ({
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
