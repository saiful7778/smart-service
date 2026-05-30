import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  numeric,
  pgTable,
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
import { UserTable } from "../user";
import { CustomerAddressTable } from "./customerAddress.table";
import { JobAddressTable } from "./jobAddress.table";
import { LeadAddressTable } from "./leadAddress.table";
import { OrgAddressTable } from "./orgAddress.table";
import { UserAddressTable } from "./userAddress.table";

export const AddressTable = pgTable(
  "addresses",
  {
    id: db_id,
    line1: varchar("line1", { length: 255 }).notNull(),
    line2: varchar("line2", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    zipCode: varchar("zip_code", { length: 20 }).notNull(),
    country: varchar("country", { length: 100 }).default("US").notNull(),
    latitude: numeric("latitude", { precision: 11, scale: 8 }),
    longitude: numeric("longitude", { precision: 11, scale: 8 }),
    placeId: varchar("place_id", { length: 255 }), // Google Places ID
    createdAt: db_created_at,
    updatedAt: db_updated_at,
    ...db_soft_delete,
  },
  (table) => [
    foreignKey({
      name: "address_deleted_by_fkey",
      columns: [table.deletedBy],
      foreignColumns: [UserTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("address_city_idx").on(table.city),
    index("address_state_idx").on(table.state),
    index("address_zip_code_idx").on(table.zipCode),
    index("address_country_idx").on(table.country),
    index("address_coordinates_idx").on(table.latitude, table.longitude),
    index("address_created_at_idx").on(table.createdAt),
    index("address_deleted_at_idx").on(table.deletedAt),
    index("address_deleted_by_idx").on(table.deletedBy),
  ]
);

export const AddressRelations = relations(AddressTable, ({ many, one }) => ({
  deletedBy: one(UserTable, {
    fields: [AddressTable.deletedBy],
    references: [UserTable.id],
    relationName: "AddressDeletedBy",
  }),
  userAddresses: many(UserAddressTable, {
    relationName: "UserAddressToAddress",
  }),
  orgAddresses: many(OrgAddressTable, {
    relationName: "OrgAddressToAddress",
  }),
  customerAddress: many(CustomerAddressTable, {
    relationName: "CustomerAddressToAddress",
  }),
  leadAddresses: many(LeadAddressTable, {
    relationName: "LeadAddressToAddress",
  }),
  jobAddresses: many(JobAddressTable, {
    relationName: "JobAddressToAddress",
  }),
}));

export const insertAddressSchema = createInsertSchema(AddressTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedBy: true,
  deletedAt: true,
});
export const selectAddressSchema = createSelectSchema(AddressTable);
export const updateAddressSchema = createUpdateSchema(AddressTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedBy: true,
  deletedAt: true,
});

export type AddressDataModel = typeof AddressTable.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type SelectAddress = z.infer<typeof selectAddressSchema>;
export type UpdateAddress = z.infer<typeof updateAddressSchema>;
