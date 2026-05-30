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
import { LeadCategoryJoinTable } from "./leadCategoryJoin.table";

export const LeadCategoryTable = pgTable(
  "lead_categories",
  {
    id: db_id,
    orgId: uuid("organization_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 255 }).notNull(),
    createdBy: uuid("created_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "lead_category_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_category_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("lead_category_slug_unique").on(table.slug),
    index("lead_category_org_id_idx").on(table.orgId),
    index("lead_category_created_by_idx").on(table.createdBy),
    index("lead_category_created_at_idx").on(table.createdAt),
  ]
);

export const LeadCategoryRelations = relations(
  LeadCategoryTable,
  ({ one, many }) => ({
    organization: one(OrganizationTable, {
      fields: [LeadCategoryTable.orgId],
      references: [OrganizationTable.id],
      relationName: "LeadCategoryToOrg",
    }),
    createdByMember: one(OrganizationMemberTable, {
      fields: [LeadCategoryTable.createdBy],
      references: [OrganizationMemberTable.id],
      relationName: "LeadCategoryToCreatedBy",
    }),
    leadJoins: many(LeadCategoryJoinTable, {
      relationName: "LeadCategoryJoinToLeadCategory",
    }),
  })
);

export const insertLeadCategorySchema = createInsertSchema(
  LeadCategoryTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLeadCategorySchema = createSelectSchema(LeadCategoryTable);
export const updateLeadCategorySchema = createUpdateSchema(
  LeadCategoryTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LeadCategoryDataModel = typeof LeadCategoryTable.$inferSelect;
export type InsertLeadCategory = z.infer<typeof insertLeadCategorySchema>;
export type UpdateLeadCategory = z.infer<typeof updateLeadCategorySchema>;
