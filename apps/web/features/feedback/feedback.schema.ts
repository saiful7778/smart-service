import z from "zod";

import {
  FeedbackIssueStatusEnumSchema,
  FeedbackIssueTypeEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

export const feedbackIssueCreateSchema = z.object({
  type: FeedbackIssueTypeEnumSchema,
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(255),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(5000),
});
export type FeedbackIssueCreateInput = z.infer<
  typeof feedbackIssueCreateSchema
>;

export const feedbackIssueReplySchema = z.object({
  issueId: z.uuid(),
  content: z
    .string()
    .trim()
    .min(1, "Reply cannot be empty")
    .max(5000),
});
export type FeedbackIssueReplyInput = z.infer<
  typeof feedbackIssueReplySchema
>;

export const feedbackIssueStatusUpdateSchema = z.object({
  issueId: z.uuid(),
  status: FeedbackIssueStatusEnumSchema,
});
export type FeedbackIssueStatusUpdateInput = z.infer<
  typeof feedbackIssueStatusUpdateSchema
>;
