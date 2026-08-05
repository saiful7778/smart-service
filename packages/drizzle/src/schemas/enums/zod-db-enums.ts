import z from "zod";

import {
  ACTION_TYPE,
  CONTACT_SUBMISSION_STATUS,
  FEEDBACK_ISSUE_STATUS,
  FEEDBACK_ISSUE_TYPE,
  JOB_ASSIGNMENT_ROLE,
  JOB_ASSIGNMENT_STATUS,
  JOB_STATUS,
  LEAD_ESTIMATE_STATUS,
  LEAD_REVENUE_TYPE,
  LEAD_SOURCE,
  LEAD_STATUS,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_LEVEL,
  PERMISSION_LEVEL,
  PRIVATE_ENTITY_TYPES,
  PUBLIC_ENTITY_TYPES,
  RESOURCE_TYPE,
  ROLE_TYPES,
  ROLES,
  TASK_PRIORITY,
  TASK_STATUS,
} from "./enum-values";

export const RoleEnumSchema = z.enum(ROLES);
export type RoleEnumType = z.infer<typeof RoleEnumSchema>;

export const RoleTypeEnumSchema = z.enum(ROLE_TYPES);
export type RoleTypeEnumType = z.infer<typeof RoleTypeEnumSchema>;

export const TaskStatusEnumSchema = z.enum(TASK_STATUS);
export type TaskStatusEnumType = z.infer<typeof TaskStatusEnumSchema>;

export const TaskPriorityEnumSchema = z.enum(TASK_PRIORITY);
export type TaskPriorityEnumType = z.infer<typeof TaskPriorityEnumSchema>;

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

export const FeedbackIssueTypeEnumSchema = z.enum(FEEDBACK_ISSUE_TYPE);
export type FeedbackIssueTypeEnumType = z.infer<
  typeof FeedbackIssueTypeEnumSchema
>;

export const FeedbackIssueStatusEnumSchema = z.enum(FEEDBACK_ISSUE_STATUS);
export type FeedbackIssueStatusEnumType = z.infer<
  typeof FeedbackIssueStatusEnumSchema
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

export const PublicEntityTypeEnumSchema = z.enum(PUBLIC_ENTITY_TYPES);
export type PublicEntityTypeEnumType = z.infer<
  typeof PublicEntityTypeEnumSchema
>;

export const PrivateEntityTypeEnumSchema = z.enum(PRIVATE_ENTITY_TYPES);
export type PrivateEntityTypeEnumType = z.infer<
  typeof PrivateEntityTypeEnumSchema
>;

export const EntityTypeEnumSchema = PublicEntityTypeEnumSchema.or(
  PrivateEntityTypeEnumSchema
);
export type EntityTypeEnumType = z.infer<typeof EntityTypeEnumSchema>;

export const LeadEstimateStatusEnumSchema = z.enum(LEAD_ESTIMATE_STATUS);
export type LeadEstimateStatusEnumType = z.infer<
  typeof LeadEstimateStatusEnumSchema
>;
