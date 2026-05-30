import { pgEnum } from "drizzle-orm/pg-core";

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

export const RoleEnum = pgEnum("RoleEnum", ROLES);

export const RoleTypeEnum = pgEnum("RoleTypeEnum", ROLE_TYPES);

export const PermissionLevelEnum = pgEnum(
  "PermissionLevelEnum",
  PERMISSION_LEVEL
);

export const ResourceTypeEnum = pgEnum("ResourceTypeEnum", RESOURCE_TYPE);

export const ActionTypeEnum = pgEnum("ActionTypeEnum", ACTION_TYPE);

export const ContactSubmissionStatusEnum = pgEnum(
  "ContactSubmissionStatusEnum",
  CONTACT_SUBMISSION_STATUS
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

export const LeadRevenueTypeEnum = pgEnum(
  "LeadRevenueTypeEnum",
  LEAD_REVENUE_TYPE
);

export const HistoryEventTypeEnum = pgEnum(
  "HistoryEventTypeEnum",
  HISTORY_EVENT_TYPE
);

export const JobAssignmentStatusEnum = pgEnum(
  "JobAssignmentStatusEnum",
  JOB_ASSIGNMENT_STATUS
);

export const JobAssignmentRoleEnum = pgEnum(
  "JobAssignmentRoleEnum",
  JOB_ASSIGNMENT_ROLE
);
