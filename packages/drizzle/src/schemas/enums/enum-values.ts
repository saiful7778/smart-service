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

export const HISTORY_EVENT_TYPE = [
  // --- Customer Events ---
  "customer_created",
  "customer_updated",

  // --- Lead Events ---
  "lead_created",
  "lead_updated",
  "lead_status_changed",
  "lead_contacted",
  "lead_converted",
  "lead_attachment_added",
  "lead_attachment_removed",
  "lead_assignment_created",
  "lead_assignment_updated",
  "lead_assignment_removed",
  "lead_note_added",
  "lead_note_updated",
  "lead_note_deleted",

  // --- Job Events ---
  "job_created",
  "job_updated",
  "job_status_changed",
  "job_started",
  "job_completed",
  "job_cancelled",
  "job_paused",
  "job_resumed",
  "job_scheduled",
  "job_rescheduled",
  "job_assigned",
  "job_reassigned",
  "job_attachment_added",
  "job_attachment_removed",
  "job_attachment_viewed",
  "job_assignment_created",
  "job_assignment_updated",
  "job_assignment_removed",
  "job_note_added",
  "job_note_updated",
  "job_note_deleted",

  // --- Time Tracking Events ---
  "time_entry_started",
  "time_entry_updated",
  "time_entry_stopped",

  // --- Schedule Events ---
  "schedule_created",
  "schedule_updated",
  "schedule_deleted",
  "schedule_confirmed",
  "schedule_cancelled",
  "schedule_rescheduled",

  // --- Upcoming Billing Events ---
  "invoice_created",
  "invoice_sent",
  "invoice_paid",
  "payment_received",
  "estimate_created",
  "estimate_accepted",
] as const;

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
