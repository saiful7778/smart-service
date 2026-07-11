import z from "zod";

import { JobStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";

import { leadAddressSchema } from "../lead/lead.schema";

export const jobCreateSchema = z.object({
  leadId: z.uuid().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: JobStatusEnumSchema.optional(),
  expectedRevenue: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return Number(value) >= 0;
    }, "Expected revenue must be greater than or equal to 0"),
  invoicedRevenue: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return Number(value) >= 0;
    }, "Invoiced revenue must be greater than or equal to 0"),
  receivedRevenue: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return Number(value) >= 0;
    }, "Received revenue must be greater than or equal to 0"),
  serviceAt: z.date().optional(),
  addresses: z.array(leadAddressSchema),
});
export type JobCreateType = z.infer<typeof jobCreateSchema>;

export const jobUpdateSchema = z.object({
  jobId: z.uuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: JobStatusEnumSchema.optional(),
  serviceAt: z.date().optional(),
});
export type JobUpdateType = z.infer<typeof jobUpdateSchema>;

export const jobTimeUpdateSchema = z.object({
  jobId: z.uuid(),
  serviceAt: z.date().optional(),
});
export type JobTimeUpdateType = z.infer<typeof jobTimeUpdateSchema>;

export const jobRevenueUpdateSchema = z.object({
  jobId: z.uuid(),
  changeReason: z.string().optional(),
  receivedRevenue: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return Number(value) >= 0;
    }, "Received revenue must be greater than or equal to 0"),
  expectedRevenue: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return Number(value) >= 0;
    }, "Expected revenue must be greater than or equal to 0"),
  invoicedRevenue: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return Number(value) >= 0;
    }, "Invoiced revenue must be greater than or equal to 0"),
});
export type JobRevenueUpdateType = z.infer<typeof jobRevenueUpdateSchema>;

export const jobAttachmentUploadSchema = z.object({
  jobId: z.uuid(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});
export type JobAttachmentUploadType = z.infer<typeof jobAttachmentUploadSchema>;
