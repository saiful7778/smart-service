import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  uuid,
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
import { CustomerAddressTable } from "../address/customerAddress.table";
import { JobTable } from "../job";
import { LeadTable } from "../lead";
import { OrganizationMemberTable, OrganizationTable } from "../org";

export const CustomerTable = pgTable(
  "customers",
  {
    id: db_id,
    orgId: uuid("organization_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    company: varchar("company", { length: 255 }),
    notes: text("notes"),
    source: varchar("source", { length: 100 }), // How they originally found you
    metadata: jsonb("metadata"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    ...db_soft_delete,
  },
  (table) => [
    foreignKey({
      name: "customer_org_fkey",
      columns: [table.orgId],
      foreignColumns: [OrganizationTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "customer_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "customer_updated_by_fkey",
      columns: [table.updatedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "customer_deleted_by_fkey",
      columns: [table.deletedBy],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("customer_org_id_idx").on(table.orgId),
    index("customer_created_at_idx").on(table.createdAt),
    index("customer_created_by_idx").on(table.createdBy),
    index("customer_updated_by_idx").on(table.updatedBy),
    index("customer_deleted_by_idx").on(table.deletedBy),
    index("customer_deleted_at_idx").on(table.deletedAt),
  ]
);

export const CustomerRelations = relations(CustomerTable, ({ one, many }) => ({
  org: one(OrganizationTable, {
    fields: [CustomerTable.orgId],
    references: [OrganizationTable.id],
    relationName: "CustomerToOrg",
  }),
  createdByMember: one(OrganizationMemberTable, {
    fields: [CustomerTable.createdBy],
    references: [OrganizationMemberTable.id],
    relationName: "CustomerToCreatedBy",
  }),
  updatedByMember: one(OrganizationMemberTable, {
    fields: [CustomerTable.updatedBy],
    references: [OrganizationMemberTable.id],
    relationName: "CustomerToUpdatedBy",
  }),
  deletedByMember: one(OrganizationMemberTable, {
    fields: [CustomerTable.deletedBy],
    references: [OrganizationMemberTable.id],
    relationName: "CustomerToDeletedBy",
  }),
  addresses: many(CustomerAddressTable, {
    relationName: "CustomerAddressToCustomer",
  }),
  leads: many(LeadTable, {
    relationName: "LeadToCustomer",
  }),
  jobs: many(JobTable, {
    relationName: "JobToCustomer",
  }),
}));

export const insertCustomerSchema = createInsertSchema(CustomerTable, {
  email: z.email(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
  updatedBy: true,
  createdBy: true,
});
export const selectCustomerSchema = createSelectSchema(CustomerTable);
export const updateCustomerSchema = createUpdateSchema(CustomerTable, {
  email: z.email().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
  updatedBy: true,
  createdBy: true,
});

export type CustomerDataModel = typeof CustomerTable.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type SelectCustomer = z.infer<typeof selectCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;
