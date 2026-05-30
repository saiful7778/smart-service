import { relations } from "drizzle-orm";
import { boolean, foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { FileTable } from "../file.table";
import { MaterialTable } from "./material.table";

export const MaterialFileTable = pgTable(
  "material_files",
  {
    id: db_id,
    materialId: uuid("material_id").notNull(),
    fileId: uuid("file_id").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "material_file_material_fkey",
      columns: [table.materialId],
      foreignColumns: [MaterialTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "material_file_file_fkey",
      columns: [table.fileId],
      foreignColumns: [FileTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("material_file_material_id_idx").on(table.materialId),
    index("material_file_file_id_idx").on(table.fileId),
    index("material_file_material_id_file_id_idx").on(
      table.materialId,
      table.fileId
    ),
  ]
);

export const MaterialFileRelations = relations(
  MaterialFileTable,
  ({ one }) => ({
    material: one(MaterialTable, {
      fields: [MaterialFileTable.materialId],
      references: [MaterialTable.id],
      relationName: "MaterialFileToMaterial",
    }),
    file: one(FileTable, {
      fields: [MaterialFileTable.fileId],
      references: [FileTable.id],
      relationName: "MaterialFileToFile",
    }),
  })
);

export const insertMaterialFileSchema = createInsertSchema(
  MaterialFileTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectMaterialFileSchema = createSelectSchema(MaterialFileTable);
export const updateMaterialFileSchema = createUpdateSchema(
  MaterialFileTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MaterialFileDataModel = typeof MaterialFileTable.$inferSelect;
export type InsertMaterialFile = z.infer<typeof insertMaterialFileSchema>;
export type SelectMaterialFile = z.infer<typeof selectMaterialFileSchema>;
export type UpdateMaterialFile = z.infer<typeof updateMaterialFileSchema>;
