import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  numeric,
  pgTable,
  text,
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

import {
  db_created_at,
  db_id,
  db_soft_delete,
  db_updated_at,
} from "../../../db-utils";
import { JobMaterialTable } from "../job/jobMaterial.table";
import { LeadEstimateMaterialTable } from "../lead";
import { OrganizationTable } from "../org/organization.table";
import { OrganizationMemberTable } from "../org/organizationMember.table";
import { MaterialFileTable } from "./materialFile.table";

export const MaterialTable = pgTable(
  "materials",
  {
    id: db_id,
    orgId: uuid("org_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    sku: varchar("sku", { length: 255 }).notNull(),
    description: text("description"),

    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    costPrice: numeric("cost_price", { precision: 12, scale: 2 }),

    stockQuantity: numeric("stock_quantity", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    minimumStockLevel: numeric("minimum_stock_level", {
      precision: 12,
      scale: 2,
    }).default("0"),

    unit: varchar("unit", { length: 50 }).notNull(),

    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
    ...db_soft_delete,
  },
  (table) => [
    foreignKey({
      name: "material_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "material_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "material_updated_by_fkey",
      columns: [table.updatedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("material_org_id_idx").on(table.orgId),
    index("material_created_by_idx").on(table.createdBy),
    index("material_updated_by_idx").on(table.updatedBy),
    uniqueIndex("material_sku_unique").on(table.orgId, table.sku),
    index("material_name_idx").on(table.name),
    index("material_stock_quantity_idx").on(table.stockQuantity),
    index("material_minimum_stock_level_idx").on(table.minimumStockLevel),
    index("material_created_at_idx").on(table.createdAt),
  ]
);

export const MaterialRelations = relations(MaterialTable, ({ one, many }) => ({
  org: one(OrganizationTable, {
    fields: [MaterialTable.orgId],
    references: [OrganizationTable.id],
    relationName: "MaterialToOrg",
  }),
  createdBy: one(OrganizationMemberTable, {
    fields: [MaterialTable.createdBy],
    references: [OrganizationMemberTable.id],
    relationName: "MaterialToCreatedBy",
  }),
  updatedBy: one(OrganizationMemberTable, {
    fields: [MaterialTable.updatedBy],
    references: [OrganizationMemberTable.id],
    relationName: "MaterialToUpdatedBy",
  }),
  deletedBy: one(OrganizationMemberTable, {
    fields: [MaterialTable.deletedBy],
    references: [OrganizationMemberTable.id],
    relationName: "MaterialToDeletedBy",
  }),
  jobMaterials: many(JobMaterialTable, {
    relationName: "JobMaterialToMaterial",
  }),
  materialFiles: many(MaterialFileTable, {
    relationName: "MaterialFileToMaterial",
  }),
  leadEstimateMaterials: many(LeadEstimateMaterialTable, {
    relationName: "LeadEstimateMaterialToMaterial",
  }),
}));

export const insertMaterialSchema = createInsertSchema(MaterialTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectMaterialSchema = createSelectSchema(MaterialTable);
export const updateMaterialSchema = createUpdateSchema(MaterialTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MaterialDataModel = typeof MaterialTable.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type SelectMaterial = z.infer<typeof selectMaterialSchema>;
export type UpdateMaterial = z.infer<typeof updateMaterialSchema>;
