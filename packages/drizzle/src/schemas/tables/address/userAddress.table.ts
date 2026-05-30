import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { UserTable } from "../user";
import { AddressTable } from "./address.table";

export const UserAddressTable = pgTable(
  "user_addresses",
  {
    id: db_id,
    userId: uuid("user_id").notNull(),
    addressId: uuid("address_id").notNull(),
    addressType: varchar("address_type"),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "user_address_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "user_address_address_fkey",
      columns: [table.addressId],
      foreignColumns: [AddressTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("user_address_user_id_idx").on(table.userId),
    index("user_address_address_id_idx").on(table.addressId),
  ]
);

export const UserAddressRelations = relations(UserAddressTable, ({ one }) => ({
  user: one(UserTable, {
    relationName: "UserAddressToUser",
    fields: [UserAddressTable.userId],
    references: [UserTable.id],
  }),
  address: one(AddressTable, {
    relationName: "UserAddressToAddress",
    fields: [UserAddressTable.addressId],
    references: [AddressTable.id],
  }),
}));

export const insertUserAddressSchema = createInsertSchema(
  UserAddressTable
).omit({
  id: true,
  createdAt: true,
});

export const selectUserAddressSchema = createSelectSchema(UserAddressTable);

export type UserAddressDataModel = typeof UserAddressTable.$inferSelect;
export type InsertUserAddress = z.infer<typeof insertUserAddressSchema>;
export type SelectUserAddress = z.infer<typeof selectUserAddressSchema>;
