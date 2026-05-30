import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
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
import { QstashStatusEnum } from "../../enums/db-enums";
import { UserTable } from "../user";

export const QstashLogTable = pgTable(
  "qstash_logs",
  {
    id: db_id,

    // Qstash message identifiers
    messageId: text("message_id").notNull(),
    deduplicationId: text("deduplication_id"),

    // Qstash-specific state
    state: QstashStatusEnum("state").notNull().default("pending"),
    retries: integer("retries").notNull().default(0),
    maxRetries: integer("max_retries").default(3),

    // Error handling
    error: text("error"),
    lastError: text("last_error"),

    // Metadata
    callback: text("callback"),
    topic: text("topic"),
    queue: text("queue"),

    // Whether this log entry is for a DLQ (dead letter queue) message
    isDeadLetter: boolean("is_dead_letter").notNull().default(false),

    // Raw Qstash event payload for reference
    rawPayload: jsonb("raw_payload"),

    // Request details
    url: text("url").notNull(),
    method: varchar("method", { length: 10 }).notNull().default("POST"),
    headers: jsonb("headers"),
    body: text("body"),

    // Response details
    responseStatus: integer("response_status"),
    responseBody: text("response_body"),
    responseHeaders: jsonb("response_headers"),

    createdBy: uuid("created_by"),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),

    scheduledAt: timestamp("scheduled_at", {
      withTimezone: true,
      precision: 3,
    }),
    deliveredAt: timestamp("delivered_at", {
      withTimezone: true,
      precision: 3,
    }),
    nextRetryAt: timestamp("next_retry_at", {
      withTimezone: true,
      precision: 3,
    }),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
      name: "fk_qstash_logs_created_by",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("idx_q_msg_id").on(table.messageId),
    index("idx_q_topic").on(table.topic),
    index("idx_q_queue").on(table.queue),
    index("idx_q_state").on(table.state),
    index("idx_q_created_at").on(table.createdAt),
    index("idx_q_delivered_at").on(table.deliveredAt),
    index("idx_q_next_retry_at").on(table.nextRetryAt),
    index("idx_q_state_created_at").on(table.state, table.createdAt),
  ]
);

export const QstashLogRelations = relations(QstashLogTable, ({ one }) => ({
  createdBy: one(UserTable, {
    fields: [QstashLogTable.createdBy],
    references: [UserTable.id],
    relationName: "QstashLogToCreatedBy",
  }),
}));

export const insertQstashLogSchema = createInsertSchema(QstashLogTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectQstashLogSchema = createSelectSchema(QstashLogTable);
export const updateQstashLogSchema = createUpdateSchema(QstashLogTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type QstashLogDataModel = typeof QstashLogTable.$inferSelect;
export type SelectQstashLog = z.infer<typeof selectQstashLogSchema>;
export type InsertQstashLog = z.infer<typeof insertQstashLogSchema>;
export type UpdateQstashLog = z.infer<typeof updateQstashLogSchema>;
