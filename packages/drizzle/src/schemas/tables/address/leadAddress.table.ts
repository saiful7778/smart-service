import { relations } from "drizzle-orm";
import { boolean, foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { LeadTable } from "../lead/lead.table";
import { AddressTable } from "./address.table";

export const LeadAddressTable = pgTable(
  "lead_addresses",
  {
    id: db_id,
    leadId: uuid("lead_id").notNull(),
    addressId: uuid("address_id").notNull(),
    isPrimary: boolean("is_primary").default(false),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "lead_address_lead_fkey",
      columns: [table.leadId],
      foreignColumns: [LeadTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "lead_address_address_fkey",
      columns: [table.addressId],
      foreignColumns: [AddressTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("lead_address_lead_id_idx").on(table.leadId),
    index("lead_address_address_id_idx").on(table.addressId),
    index("lead_address_is_primary_idx").on(table.isPrimary),
  ]
);

export const LeadAddressRelations = relations(LeadAddressTable, ({ one }) => ({
  lead: one(LeadTable, {
    fields: [LeadAddressTable.leadId],
    references: [LeadTable.id],
    relationName: "LeadAddressToLead",
  }),
  address: one(AddressTable, {
    fields: [LeadAddressTable.addressId],
    references: [AddressTable.id],
    relationName: "LeadAddressToAddress",
  }),
}));

export const insertLeadAddressSchema = createInsertSchema(
  LeadAddressTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLeadAddressSchema = createSelectSchema(LeadAddressTable);
export const updateLeadAddressSchema = createUpdateSchema(
  LeadAddressTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LeadAddressDataModel = typeof LeadAddressTable.$inferSelect;
export type InsertLeadAddress = z.infer<typeof insertLeadAddressSchema>;
export type SelectLeadAddress = z.infer<typeof selectLeadAddressSchema>;
export type UpdateLeadAddress = z.infer<typeof updateLeadAddressSchema>;
