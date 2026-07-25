import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { MaterialTable } from "../material/material.table";
import { LeadEstimateTable } from "./leadEstimate.table";

export const LeadEstimateMaterialTable = pgTable(
  "lead_estimate_materials",
  {
    id: db_id,
    estimateId: uuid("estimate_id").notNull(),
    materialId: uuid("material_id").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
    totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "lead_estimate_material_estimate_fkey",
      columns: [table.estimateId],
      foreignColumns: [LeadEstimateTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_estimate_material_material_fkey",
      columns: [table.materialId],
      foreignColumns: [MaterialTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("lead_estimate_material_estimate_id_idx").on(table.estimateId),
    index("lead_estimate_material_material_id_idx").on(table.materialId),
    index("lead_estimate_material_quantity_idx").on(table.quantity),
    index("lead_estimate_material_created_at_idx").on(table.createdAt),
  ]
);

export const LeadEstimateMaterialRelations = relations(
  LeadEstimateMaterialTable,
  ({ one }) => ({
    estimate: one(LeadEstimateTable, {
      fields: [LeadEstimateMaterialTable.estimateId],
      references: [LeadEstimateTable.id],
      relationName: "LeadEstimateMaterialToEstimate",
    }),
    material: one(MaterialTable, {
      fields: [LeadEstimateMaterialTable.materialId],
      references: [MaterialTable.id],
      relationName: "LeadEstimateMaterialToMaterial",
    }),
  })
);

export const insertLeadEstimateMaterialSchema = createInsertSchema(
  LeadEstimateMaterialTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLeadEstimateMaterialSchema = createSelectSchema(
  LeadEstimateMaterialTable
);
export const updateLeadEstimateMaterialSchema = createUpdateSchema(
  LeadEstimateMaterialTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LeadEstimateMaterialDataModel =
  typeof LeadEstimateMaterialTable.$inferSelect;
export type InsertLeadEstimateMaterial = z.infer<
  typeof insertLeadEstimateMaterialSchema
>;
export type SelectLeadEstimateMaterial = z.infer<
  typeof selectLeadEstimateMaterialSchema
>;
export type UpdateLeadEstimateMaterial = z.infer<
  typeof updateLeadEstimateMaterialSchema
>;
