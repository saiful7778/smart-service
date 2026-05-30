import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { JobTable } from "./job.table";
import { JobCategoryTable } from "./jobCategory.table";

export const JobCategoryJoinTable = pgTable(
  "job_category_joins",
  {
    id: db_id,
    jobId: uuid("job_id").notNull(),
    jobCategoryId: uuid("job_category_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      columns: [table.jobId],
      foreignColumns: [JobTable.id],
      name: "job_category_join_job_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.jobCategoryId],
      foreignColumns: [JobCategoryTable.id],
      name: "job_category_join_job_category_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("job_category_join_job_id_idx").on(table.jobId),
    index("job_category_join_job_category_id_idx").on(table.jobCategoryId),
    uniqueIndex("job_category_join_unique").on(
      table.jobId,
      table.jobCategoryId
    ),
  ]
);

export const JobCategoryJoinRelations = relations(
  JobCategoryJoinTable,
  ({ one }) => ({
    job: one(JobTable, {
      fields: [JobCategoryJoinTable.jobId],
      references: [JobTable.id],
      relationName: "JobCategoryJoinToJob",
    }),
    jobCategory: one(JobCategoryTable, {
      fields: [JobCategoryJoinTable.jobCategoryId],
      references: [JobCategoryTable.id],
      relationName: "JobCategoryJoinToJobCategory",
    }),
  })
);

export const JobCategoryJoinInsertSchema = createInsertSchema(
  JobCategoryJoinTable
).omit({
  id: true,
  createdAt: true,
});

export type JobCategoryJoinDataModel = typeof JobCategoryJoinTable.$inferSelect;
export type InsertJobCategoryJoin = z.infer<typeof JobCategoryJoinInsertSchema>;
