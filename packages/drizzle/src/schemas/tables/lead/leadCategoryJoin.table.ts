import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { LeadTable } from "./lead.table";
import { LeadCategoryTable } from "./leadCategory.table";

export const LeadCategoryJoinTable = pgTable(
  "lead_category_joins",
  {
    id: db_id,
    leadId: uuid("lead_id").notNull(),
    leadCategoryId: uuid("lead_category_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "lead_category_join_lead_fkey",
      columns: [table.leadId],
      foreignColumns: [LeadTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_category_join_lead_category_fkey",
      columns: [table.leadCategoryId],
      foreignColumns: [LeadCategoryTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("lead_category_join_unique").on(
      table.leadId,
      table.leadCategoryId
    ),
    index("lead_category_join_lead_id_idx").on(table.leadId),
    index("lead_category_join_lead_category_id_idx").on(table.leadCategoryId),
  ]
);

export const LeadCategoryJoinRelations = relations(
  LeadCategoryJoinTable,
  ({ one }) => ({
    lead: one(LeadTable, {
      fields: [LeadCategoryJoinTable.leadId],
      references: [LeadTable.id],
      relationName: "LeadCategoryJoinToLead",
    }),
    leadCategory: one(LeadCategoryTable, {
      fields: [LeadCategoryJoinTable.leadCategoryId],
      references: [LeadCategoryTable.id],
      relationName: "LeadCategoryJoinToLeadCategory",
    }),
  })
);

export const insertLeadCategoryJoinSchema = createInsertSchema(
  LeadCategoryJoinTable
).omit({
  id: true,
  createdAt: true,
});

export type LeadCategoryJoinDataModel =
  typeof LeadCategoryJoinTable.$inferSelect;
export type InsertLeadCategoryJoin = z.infer<
  typeof insertLeadCategoryJoinSchema
>;
