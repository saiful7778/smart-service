import z from "zod";

import {
  ACTION_TYPE,
  CONTACT_SUBMISSION_STATUS,
  HISTORY_EVENT_TYPE,
  JOB_ASSIGNMENT_ROLE,
  JOB_ASSIGNMENT_STATUS,
  JOB_STATUS,
  LEAD_REVENUE_TYPE,
  LEAD_SOURCE,
  LEAD_STATUS,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_LEVEL,
  PERMISSION_LEVEL,
  RESOURCE_TYPE,
  ROLE_TYPES,
  ROLES,
} from "./enum-values";

export const RoleEnumSchema = z.enum(ROLES);
export type RoleEnumType = z.infer<typeof RoleEnumSchema>;

export const RoleTypeEnumSchema = z.enum(ROLE_TYPES);
export type RoleTypeEnumType = z.infer<typeof RoleTypeEnumSchema>;

export const PermissionLevelEnumSchema = z.enum(PERMISSION_LEVEL);
export type PermissionLevelEnumType = z.infer<typeof PermissionLevelEnumSchema>;

export const ResourceTypeEnumSchema = z.enum(RESOURCE_TYPE);
export type ResourceTypeEnumType = z.infer<typeof ResourceTypeEnumSchema>;

export const ActionTypeEnumSchema = z.enum(ACTION_TYPE);
export type ActionTypeEnumType = z.infer<typeof ActionTypeEnumSchema>;

export const ContactSubmissionStatusEnumSchema = z.enum(
  CONTACT_SUBMISSION_STATUS
);
export type ContactSubmissionStatusEnumType = z.infer<
  typeof ContactSubmissionStatusEnumSchema
>;

export const NotificationCategoryEnumSchema = z.enum(NOTIFICATION_CATEGORY);
export type NotificationCategoryEnumType = z.infer<
  typeof NotificationCategoryEnumSchema
>;

export const NotificationLevelEnumSchema = z.enum(NOTIFICATION_LEVEL);
export type NotificationLevelEnumType = z.infer<
  typeof NotificationLevelEnumSchema
>;

export const LeadSourceEnumSchema = z.enum(LEAD_SOURCE);
export type LeadSourceEnumType = z.infer<typeof LeadSourceEnumSchema>;

export const LeadStatusEnumSchema = z.enum(LEAD_STATUS);
export type LeadStatusEnumType = z.infer<typeof LeadStatusEnumSchema>;

export const LeadRevenueTypeEnumSchema = z.enum(LEAD_REVENUE_TYPE);
export type LeadRevenueTypeEnumType = z.infer<typeof LeadRevenueTypeEnumSchema>;

export const HistoryEventTypeEnumSchema = z.enum(HISTORY_EVENT_TYPE);
export type HistoryEventTypeEnumType = z.infer<
  typeof HistoryEventTypeEnumSchema
>;

export const JobStatusEnumSchema = z.enum(JOB_STATUS);
export type JobStatusEnumType = z.infer<typeof JobStatusEnumSchema>;

export const JobAssignmentStatusEnumSchema = z.enum(JOB_ASSIGNMENT_STATUS);
export type JobAssignmentStatusEnumType = z.infer<
  typeof JobAssignmentStatusEnumSchema
>;

export const JobAssignmentRoleEnumSchema = z.enum(JOB_ASSIGNMENT_ROLE);
export type JobAssignmentRoleEnumType = z.infer<
  typeof JobAssignmentRoleEnumSchema
>;
