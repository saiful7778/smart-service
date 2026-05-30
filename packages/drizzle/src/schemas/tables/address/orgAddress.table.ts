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
import { OrganizationTable } from "../org/organization.table";
import { AddressTable } from "./address.table";

export const OrgAddressTable = pgTable(
  "org_addresses",
  {
    id: db_id,
    orgId: uuid("organization_id").notNull(),
    addressId: uuid("address_id").notNull(),
    isPrimary: boolean("is_primary").default(false),
    addressType: varchar("address_type"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "org_address_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "org_address_address_fkey",
      columns: [table.addressId],
      foreignColumns: [AddressTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("org_address_org_id_idx").on(table.orgId),
    index("org_address_address_id_idx").on(table.addressId),
    index("org_address_is_primary_idx").on(table.isPrimary),
  ]
);

export const OrgAddressRelations = relations(OrgAddressTable, ({ one }) => ({
  organization: one(OrganizationTable, {
    fields: [OrgAddressTable.orgId],
    references: [OrganizationTable.id],
    relationName: "OrgAddressToOrg",
  }),
  address: one(AddressTable, {
    fields: [OrgAddressTable.addressId],
    references: [AddressTable.id],
    relationName: "OrgAddressToAddress",
  }),
}));

export const insertOrgAddressSchema = createInsertSchema(OrgAddressTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectOrgAddressSchema = createSelectSchema(OrgAddressTable);
export const updateOrgAddressSchema = createUpdateSchema(OrgAddressTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OrgAddressDataModel = typeof OrgAddressTable.$inferSelect;
export type InsertOrgAddress = z.infer<typeof insertOrgAddressSchema>;
export type SelectOrgAddress = z.infer<typeof selectOrgAddressSchema>;
export type UpdateOrgAddress = z.infer<typeof updateOrgAddressSchema>;
