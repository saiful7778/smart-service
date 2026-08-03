export const ROLES = [
  // org roles
  "MEMBER",
  "STAFF",
  "DISPATCHER",
  "TEAM_LEAD",
  "MANAGER",
  "ORG_SUPPORT_AGENT",
  "ORG_ADMIN",
  "OWNER",
  // system roles
  "USER",
  "SYSTEM_SUPPORT_AGENT",
  "SYSTEM_ADMIN",
  "SUPER_ADMIN",
] as const;

export const ROLE_TYPES = ["SYSTEM", "ORG"] as const;

export const PERMISSION_LEVEL = ["system", "org", "self"] as const;

export const RESOURCE_TYPE = [
  // core
  "user",
  "role",
  "permission",
  "org",
  "invitation",

  // inventory
  "material",

  // team
  "team",
  "team_member",

  // customer
  "customer",

  // Lead
  "lead",
  "lead_category",
  "lead_attachment",
  "lead_note",
  "lead_invoice",
  "lead_payment",
  "lead_billing",
  "lead_report",
  "lead_estimate",

  // Job
  "job",
  "job_category",
  "job_material",
  "job_assignment",
  "job_attachment",
  "job_note",
  "job_revenue",
  "job_invoice",
  "job_payment",
  "job_estimate",
  "job_billing",
  "job_time_entry",

  // Financial
  "invoice",
  "payment",
  "billing",
  "report",

  // Time
  "schedule",

  // Support / Feedback
  "feedback",
] as const;

export const ACTION_TYPE = [
  "create",
  "read",
  "list",
  "update",
  "delete",
  "manage",
  "export",
] as const;

export const CONTACT_SUBMISSION_STATUS = [
  "PENDING",
  "READ",
  "REPLIED",
  "SPAM",
] as const;

export const FEEDBACK_ISSUE_TYPE = [
  "BUG",
  "FEATURE_REQUEST",
  "FEEDBACK",
  "SUGGESTION",
  "REPORT",
  "OTHER",
] as const;

export const FEEDBACK_ISSUE_STATUS = [
  "OPEN",
  "IN_PROGRESS",
  "NEEDS_INFO",
  "RESOLVED",
  "CLOSED",
] as const;

export const NOTIFICATION_CATEGORY = [
  "SYSTEM",
  "ORG",
  "AUTH",
  "SUPPORT",

  "CUSTOMER",
  "LEAD",
  "JOB",

  "INVOICE",
  "PAYMENT",
  "BILLING",
  "REPORT",

  "SCHEDULE",
] as const;

export const NOTIFICATION_LEVEL = [
  "INFO",
  "SUCCESS",
  "WARNING",
  "ERROR",
] as const;

export const LEAD_SOURCE = [
  "manual", // Internal form within your app
  "webhook", // External webhook integration
  "iframe", // Embedded iframe form
] as const;

export const LEAD_STATUS = [
  "new",
  "contacted",
  "qualified",
  "nurture",
  "converted",
  "lost",
  "cancelled",
  "disqualified",
] as const;

export const LEAD_ESTIMATE_STATUS = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "declined",
  "expired",
] as const;

export const JOB_STATUS = [
  "draft",
  "scheduled",
  "in_progress",
  "on_hold",
  "needs_review",
  "completed",
  "cancelled",
] as const;

export const LEAD_REVENUE_TYPE = ["expected", "invoiced", "received"] as const;

export const JOB_ASSIGNMENT_STATUS = [
  "active", // Currently assigned and active
  "completed", // Work completed
  "cancelled", // Assignment cancelled
  "pending", // Awaiting employee confirmation
  "declined", // Employee declined
] as const;

export const JOB_ASSIGNMENT_ROLE = [
  "primary", // Lead employee
  "secondary", // Supporting employee
  "supervisor", // Supervising employee
  "trainee", // Employee in training
] as const;

export const PRIVATE_ENTITY_TYPES = [
  "lead_attachment",
  "job_attachment",
  "material_file",
  "lead_payment",
  "job_payment",
] as const;

export const PUBLIC_ENTITY_TYPES = ["profile_image", "org_logo"] as const;
