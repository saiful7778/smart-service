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
import { MaterialTable } from "../material";
import { OrganizationMemberTable } from "../org";
import { JobTable } from "./job.table";

export const JobMaterialTable = pgTable(
  "job_materials",
  {
    id: db_id,
    jobId: uuid("job_id").notNull(),
    materialId: uuid("material_id").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),

    createdBy: uuid("created_by").notNull(),
    updatedBy: uuid("updated_by").notNull(),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "job_material_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_material_material_fkey",
      columns: [table.materialId],
      foreignColumns: [MaterialTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_material_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_material_updated_by_fkey",
      columns: [table.updatedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("job_material_job_id_idx").on(table.jobId),
    index("job_material_material_id_idx").on(table.materialId),
    index("job_material_created_by_idx").on(table.createdBy),
    index("job_material_updated_by_idx").on(table.updatedBy),
    index("job_material_quantity_idx").on(table.quantity),
    index("job_material_created_at_idx").on(table.createdAt),
  ]
);

export const JobMaterialRelations = relations(JobMaterialTable, ({ one }) => ({
  job: one(JobTable, {
    fields: [JobMaterialTable.jobId],
    references: [JobTable.id],
    relationName: "JobMaterialToJob",
  }),
  material: one(MaterialTable, {
    fields: [JobMaterialTable.materialId],
    references: [MaterialTable.id],
    relationName: "JobMaterialToMaterial",
  }),
  createdBy: one(OrganizationMemberTable, {
    fields: [JobMaterialTable.createdBy],
    references: [OrganizationMemberTable.id],
    relationName: "JobMaterialToCreatedBy",
  }),
  updatedBy: one(OrganizationMemberTable, {
    fields: [JobMaterialTable.updatedBy],
    references: [OrganizationMemberTable.id],
    relationName: "JobMaterialToUpdatedBy",
  }),
}));

export const insertJobMaterialSchema = createInsertSchema(
  JobMaterialTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectJobMaterialSchema = createSelectSchema(JobMaterialTable);
export const updateJobMaterialSchema = createUpdateSchema(
  JobMaterialTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type JobMaterialDataModel = typeof JobMaterialTable.$inferSelect;
export type InsertJobMaterial = z.infer<typeof insertJobMaterialSchema>;
export type SelectJobMaterial = z.infer<typeof selectJobMaterialSchema>;
export type UpdateJobMaterial = z.infer<typeof updateJobMaterialSchema>;
