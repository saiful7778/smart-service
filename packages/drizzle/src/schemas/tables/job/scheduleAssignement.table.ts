import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { OrganizationMemberTable } from "../org";
import { ScheduleTable } from "./schedule.table";

export const ScheduleAssignementTable = pgTable(
  "schedule_assignments",
  {
    id: db_id,
    scheduleId: uuid("schedule_id").notNull(),
    memberId: uuid("member_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "schedule_assignement_schedule_fkey",
      columns: [table.scheduleId],
      foreignColumns: [ScheduleTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "schedule_assignement_org_member_fkey",
      columns: [table.memberId],
      foreignColumns: [OrganizationMemberTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("schedule_assignement_schedule_id_org_member_id_key").on(
      table.scheduleId,
      table.memberId
    ),
    index("schedule_assignement_schedule_id_idx").on(table.scheduleId),
    index("schedule_assignement_org_member_id_idx").on(table.memberId),
    index("schedule_assignement_created_at_idx").on(table.createdAt),
  ]
);

export const ScheduleAssignementRelations = relations(
  ScheduleAssignementTable,
  ({ one }) => ({
    schedule: one(ScheduleTable, {
      fields: [ScheduleAssignementTable.scheduleId],
      references: [ScheduleTable.id],
      relationName: "ScheduleAssignementToSchedule",
    }),
    orgMember: one(OrganizationMemberTable, {
      fields: [ScheduleAssignementTable.memberId],
      references: [OrganizationMemberTable.id],
      relationName: "ScheduleAssignementToOrgMember",
    }),
  })
);

export const insertScheduleAssignementSchema = createInsertSchema(
  ScheduleAssignementTable
).omit({
  id: true,
  createdAt: true,
});
export const selectScheduleAssignementSchema = createSelectSchema(
  ScheduleAssignementTable
);

export type ScheduleAssignementDataModel =
  typeof ScheduleAssignementTable.$inferSelect;
export type InsertScheduleAssignement = z.infer<
  typeof insertScheduleAssignementSchema
>;
export type SelectScheduleAssignement = z.infer<
  typeof selectScheduleAssignementSchema
>;
