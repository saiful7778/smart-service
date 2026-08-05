import { pgEnum } from "drizzle-orm/pg-core";

import {
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
  ROLE_TYPES,
  ROLES,
  TASK_PRIORITY,
  TASK_STATUS,
} from "./enum-values";

export const RoleEnum = pgEnum("RoleEnum", ROLES);

export const RoleTypeEnum = pgEnum("RoleTypeEnum", ROLE_TYPES);

export const TaskStatusEnum = pgEnum("TaskStatusEnum", TASK_STATUS);

export const TaskPriorityEnum = pgEnum("TaskPriorityEnum", TASK_PRIORITY);

export const ContactSubmissionStatusEnum = pgEnum(
  "ContactSubmissionStatusEnum",
  CONTACT_SUBMISSION_STATUS
);

export const FeedbackIssueTypeEnum = pgEnum(
  "FeedbackIssueTypeEnum",
  FEEDBACK_ISSUE_TYPE
);

export const FeedbackIssueStatusEnum = pgEnum(
  "FeedbackIssueStatusEnum",
  FEEDBACK_ISSUE_STATUS
);

export const NotificationCategoryEnum = pgEnum(
  "NotificationCategoryEnum",
  NOTIFICATION_CATEGORY
);

export const NotificationLevelEnum = pgEnum(
  "NotificationLevelEnum",
  NOTIFICATION_LEVEL
);

export const LeadSourceEnum = pgEnum("LeadSourceEnum", LEAD_SOURCE);

export const LeadStatusEnum = pgEnum("LeadStatusEnum", LEAD_STATUS);

export const JobStatusEnum = pgEnum("JobStatusEnum", JOB_STATUS);

export const LeadEstimateStatusEnum = pgEnum(
  "LeadEstimateStatusEnum",
  LEAD_ESTIMATE_STATUS
);

export const LeadRevenueTypeEnum = pgEnum(
  "LeadRevenueTypeEnum",
  LEAD_REVENUE_TYPE
);

export const JobAssignmentStatusEnum = pgEnum(
  "JobAssignmentStatusEnum",
  JOB_ASSIGNMENT_STATUS
);

export const JobAssignmentRoleEnum = pgEnum(
  "JobAssignmentRoleEnum",
  JOB_ASSIGNMENT_ROLE
);
