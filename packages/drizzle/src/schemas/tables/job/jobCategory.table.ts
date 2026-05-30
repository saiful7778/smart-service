import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
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

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { OrganizationMemberTable, OrganizationTable } from "../org";
import { JobCategoryJoinTable } from "./jobCategoryJoin.table";

export const JobCategoryTable = pgTable(
  "job_categories",
  {
    id: db_id,
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull(),
    description: text("description"),
    orgId: uuid("organization_id").notNull(),
    createdBy: uuid("created_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("job_categories_organization_id_idx").on(table.orgId),
    index("job_categories_created_by_idx").on(table.createdBy),
    uniqueIndex("job_categories_slug_unique").on(table.slug),
    uniqueIndex("job_categories_organization_id_slug_unique").on(
      table.orgId,
      table.slug
    ),
    index("job_categories_created_at_idx").on(table.createdAt),
  ]
);

export const JobCategoryRelations = relations(
  JobCategoryTable,
  ({ one, many }) => ({
    organization: one(OrganizationTable, {
      fields: [JobCategoryTable.orgId],
      references: [OrganizationTable.id],
      relationName: "JobCategoryToOrg",
    }),
    createdBy: one(OrganizationMemberTable, {
      fields: [JobCategoryTable.createdBy],
      references: [OrganizationMemberTable.id],
      relationName: "JobCategoryToCreatedBy",
    }),
    jobJoins: many(JobCategoryJoinTable, {
      relationName: "JobCategoryJoinToJobCategory",
    }),
  })
);

export const insertJobCategorySchema = createInsertSchema(
  JobCategoryTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectJobCategorySchema = createSelectSchema(JobCategoryTable);
export const updateJobCategorySchema = createUpdateSchema(
  JobCategoryTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type JobCategoryDataModel = typeof JobCategoryTable.$inferSelect;
export type InsertJobCategory = z.infer<typeof insertJobCategorySchema>;
export type SelectJobCategory = z.infer<typeof selectJobCategorySchema>;
export type UpdateJobCategory = z.infer<typeof updateJobCategorySchema>;
