import { relations } from "drizzle-orm";
import {
  foreignKey,
  pgTable,
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
import { UserTable } from "./user.table";

export const UserSettingsTable = pgTable(
  "user_settings",
  {
    id: db_id,
    userId: uuid("user_id").notNull(),
    timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
    locale: varchar("locale", { length: 10 }).default("en-US").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "user_settings_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("user_settings_user_id_idx").on(table.userId),
  ]
);

export const UserSettingsRelations = relations(
  UserSettingsTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserSettingsTable.userId],
      references: [UserTable.id],
      relationName: "UserSettingsToUser",
    }),
  })
);

export const insertUserSettingsSchema = createInsertSchema(
  UserSettingsTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectUserSettingsSchema = createSelectSchema(UserSettingsTable);
export const updateUserSettingsSchema = createUpdateSchema(
  UserSettingsTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserSettingsDataModel = typeof UserSettingsTable.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type SelectUserSettings = z.infer<typeof selectUserSettingsSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
