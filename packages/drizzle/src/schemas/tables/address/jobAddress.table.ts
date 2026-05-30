import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { AddressTable } from "../address/address.table";
import { JobTable } from "../job/job.table";

export const JobAddressTable = pgTable(
  "job_addresses",
  {
    id: db_id,
    addressId: uuid("address_id").notNull(),
    jobId: uuid("job_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "job_address_address_fkey",
      columns: [table.addressId],
      foreignColumns: [AddressTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "job_address_job_fkey",
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("job_address_address_id_idx").on(table.addressId),
    index("job_address_job_id_idx").on(table.jobId),
    index("job_address_created_at_idx").on(table.createdAt),
  ]
);

export const JobAddressRelations = relations(JobAddressTable, ({ one }) => ({
  address: one(AddressTable, {
    fields: [JobAddressTable.addressId],
    references: [AddressTable.id],
    relationName: "JobAddressToAddress",
  }),
  job: one(JobTable, {
    fields: [JobAddressTable.jobId],
    references: [JobTable.id],
    relationName: "JobAddressToJob",
  }),
}));

export const JobAddressInsertSchema = createInsertSchema(JobAddressTable).omit({
  id: true,
  createdAt: true,
});
export const JobAddressSelectSchema = createSelectSchema(JobAddressTable);

export type JobAddressDataModel = typeof JobAddressTable.$inferSelect;
export type InsertJobAddress = z.infer<typeof JobAddressInsertSchema>;
export type SelectJobAddress = z.infer<typeof JobAddressSelectSchema>;
