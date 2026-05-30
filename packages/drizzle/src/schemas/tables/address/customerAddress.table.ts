import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  pgTable,
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
import { CustomerTable } from "../customer";
import { AddressTable } from "./address.table";

export const CustomerAddressTable = pgTable(
  "customer_addresses",
  {
    id: db_id,
    customerId: uuid("customer_id").notNull(),
    addressId: uuid("address_id").notNull(),
    addressType: varchar("address_type", { length: 255 }).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "customerAddress_customer_fkey",
      columns: [table.customerId],
      foreignColumns: [CustomerTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "customerAddress_address_fkey",
      columns: [table.addressId],
      foreignColumns: [AddressTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("customerAddress_customer_id_idx").on(table.customerId),
    index("customerAddress_address_id_idx").on(table.addressId),
    index("customerAddress_created_at_idx").on(table.createdAt),
  ]
);

export const CustomerAddressRelations = relations(
  CustomerAddressTable,
  ({ one }) => ({
    customer: one(CustomerTable, {
      fields: [CustomerAddressTable.customerId],
      references: [CustomerTable.id],
      relationName: "CustomerAddressToCustomer",
    }),
    address: one(AddressTable, {
      fields: [CustomerAddressTable.addressId],
      references: [AddressTable.id],
      relationName: "CustomerAddressToAddress",
    }),
  })
);

export const insertCustomerAddressSchema = createInsertSchema(
  CustomerAddressTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectCustomerAddressSchema =
  createSelectSchema(CustomerAddressTable);
export const updateCustomerAddressSchema = createUpdateSchema(
  CustomerAddressTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CustomerAddressDataModel = typeof CustomerAddressTable.$inferSelect;
export type InsertCustomerAddress = z.infer<typeof insertCustomerAddressSchema>;
export type SelectCustomerAddress = z.infer<typeof selectCustomerAddressSchema>;
export type UpdateCustomerAddress = z.infer<typeof updateCustomerAddressSchema>;
