import {
  InsertPermission,
  PermissionDataModel,
  PermissionTable,
} from "../schemas";
import {
  ActionTypeEnumType,
  PermissionLevelEnumType,
  ResourceTypeEnumType,
} from "../schemas/enums/zod-db-enums";
import { db } from "./seed-db-client";

export const separator = ".";

export type PermissionType =
  `${PermissionLevelEnumType}${typeof separator}${ResourceTypeEnumType}${typeof separator}${ActionTypeEnumType}`;

type CreatePermissionType = Omit<InsertPermission, "name">;

const selfPermissions: CreatePermissionType[] = [
  {
    level: "self",
    resource: "user",
    action: "read",
    description: "View own user profile",
  },
  {
    level: "self",
    resource: "user",
    action: "update",
    description: "Update own user profile",
  },
  {
    level: "self",
    resource: "org",
    action: "create",
    description: "Create own organization",
  },
  // self feedback permissions
  {
    level: "self",
    resource: "feedback",
    action: "create",
    description: "Create own feedback issue",
  },
  {
    level: "self",
    resource: "feedback",
    action: "read",
    description: "View own feedback issues",
  },
  {
    level: "self",
    resource: "feedback",
    action: "list",
    description: "List own feedback issues",
  },
  {
    level: "self",
    resource: "feedback",
    action: "update",
    description: "Update own feedback issues",
  },
];

const systemPermissions: CreatePermissionType[] = [
  {
    level: "system",
    resource: "user",
    action: "read",
    description: "View any user in system",
  },
  {
    level: "system",
    resource: "user",
    action: "list",
    description: "List all users in system",
  },
  {
    level: "system",
    resource: "user",
    action: "create",
    description: "Create users across system",
  },
  {
    level: "system",
    resource: "user",
    action: "update",
    description: "Update any user in system",
  },
  {
    level: "system",
    resource: "user",
    action: "manage",
    description: "Full system-wide user management",
  },
  // system permission permissions
  {
    level: "system",
    resource: "permission",
    action: "read",
    description: "View permissions within system",
  },
  {
    level: "system",
    resource: "permission",
    action: "list",
    description: "List all permissions in system",
  },
  // system org permissions
  {
    level: "system",
    resource: "org",
    action: "read",
    description: "View any organization in system",
  },
  {
    level: "system",
    resource: "org",
    action: "list",
    description: "List all organizations in system",
  },
  // System-wide role management
  {
    level: "system",
    resource: "role",
    action: "read",
    description: "View any role in system",
  },
  {
    level: "system",
    resource: "role",
    action: "list",
    description: "List all roles in system",
  },
  {
    level: "system",
    resource: "role",
    action: "create",
    description: "Create system roles",
  },
  {
    level: "system",
    resource: "role",
    action: "update",
    description: "Update any role in system",
  },
  // system report permission
  {
    level: "system",
    resource: "report",
    action: "manage",
    description: "Full system-wide report management",
  },
  {
    level: "system",
    resource: "report",
    action: "read",
    description: "View any report in system",
  },
  {
    level: "system",
    resource: "report",
    action: "list",
    description: "List all reports in system",
  },
  {
    level: "system",
    resource: "report",
    action: "create",
    description: "Create reports across system",
  },
  {
    level: "system",
    resource: "report",
    action: "update",
    description: "Update any report in system",
  },
  {
    level: "system",
    resource: "report",
    action: "delete",
    description: "Delete any report from system",
  },

  // system billing permission
  {
    level: "system",
    resource: "billing",
    action: "manage",
    description: "Full billing management",
  },
  {
    level: "system",
    resource: "billing",
    action: "read",
    description: "View billing",
  },
  {
    level: "system",
    resource: "billing",
    action: "create",
    description: "Create billing",
  },
  {
    level: "system",
    resource: "billing",
    action: "update",
    description: "Update billing",
  },
  {
    level: "system",
    resource: "billing",
    action: "delete",
    description: "Delete billing",
  },

  // payment permissions
  {
    level: "system",
    resource: "payment",
    action: "manage",
    description: "Full payment management",
  },
  {
    level: "system",
    resource: "payment",
    action: "read",
    description: "View payments",
  },
  {
    level: "system",
    resource: "payment",
    action: "create",
    description: "Create payments",
  },
  {
    level: "system",
    resource: "payment",
    action: "update",
    description: "Update payments",
  },
  {
    level: "system",
    resource: "payment",
    action: "delete",
    description: "Delete payments",
  },

  // invoice permissions
  {
    level: "system",
    resource: "invoice",
    action: "manage",
    description: "Full invoice management",
  },
  {
    level: "system",
    resource: "invoice",
    action: "read",
    description: "View invoices",
  },
  {
    level: "system",
    resource: "invoice",
    action: "create",
    description: "Create invoices",
  },
  {
    level: "system",
    resource: "invoice",
    action: "update",
    description: "Update invoices",
  },
  {
    level: "system",
    resource: "invoice",
    action: "delete",
    description: "Delete invoices",
  },

  // system feedback permissions
  {
    level: "system",
    resource: "feedback",
    action: "create",
    description: "Create feedback issues across system",
  },
  {
    level: "system",
    resource: "feedback",
    action: "read",
    description: "View any feedback issue in system",
  },
  {
    level: "system",
    resource: "feedback",
    action: "list",
    description: "List all feedback issues in system",
  },
  {
    level: "system",
    resource: "feedback",
    action: "update",
    description: "Update any feedback issue in system",
  },
];

const orgPermissions: CreatePermissionType[] = [
  {
    level: "org",
    resource: "org",
    action: "read",
    description: "View own organization",
  },
  {
    level: "org",
    resource: "org",
    action: "update",
    description: "Update own organization",
  },
  // invitation permissions
  {
    level: "org",
    resource: "invitation",
    action: "manage",
    description: "Full invitation management within organization",
  },
  {
    level: "org",
    resource: "invitation",
    action: "create",
    description: "Create invitation from organization",
  },
  {
    level: "org",
    resource: "invitation",
    action: "list",
    description: "List invitations within organization",
  },
  {
    level: "org",
    resource: "invitation",
    action: "read",
    description: "View invitations within organization",
  },
  {
    level: "org",
    resource: "invitation",
    action: "update",
    description: "Update invitations within organization",
  },
  {
    level: "org",
    resource: "invitation",
    action: "delete",
    description: "Delete invitations from organization",
  },
  // material permissions
  {
    level: "org",
    resource: "material",
    action: "manage",
    description: "Full material management within organization",
  },
  {
    level: "org",
    resource: "material",
    action: "create",
    description: "Create material from organization",
  },
  {
    level: "org",
    resource: "material",
    action: "read",
    description: "View material within organization",
  },
  {
    level: "org",
    resource: "material",
    action: "list",
    description: "List material within organization",
  },
  {
    level: "org",
    resource: "material",
    action: "update",
    description: "Update material within organization",
  },
  {
    level: "org",
    resource: "material",
    action: "delete",
    description: "Delete material from organization",
  },
  // team permissions
  {
    level: "org",
    resource: "team",
    action: "manage",
    description: "Full team management within organization",
  },
  {
    level: "org",
    resource: "team",
    action: "create",
    description: "Create team from organization",
  },
  {
    level: "org",
    resource: "team",
    action: "read",
    description: "View teams within organization",
  },
  {
    level: "org",
    resource: "team",
    action: "list",
    description: "List teams within organization",
  },
  {
    level: "org",
    resource: "team",
    action: "update",
    description: "Update teams within organization",
  },
  {
    level: "org",
    resource: "team",
    action: "delete",
    description: "Delete teams from organization",
  },
  // team member permisssion
  {
    level: "org",
    resource: "team_member",
    action: "manage",
    description: "Full team member management within organization",
  },
  {
    level: "org",
    resource: "team_member",
    action: "create",
    description: "Create team member from organization",
  },
  {
    level: "org",
    resource: "team_member",
    action: "read",
    description: "View team members within organization",
  },
  {
    level: "org",
    resource: "team_member",
    action: "list",
    description: "List team members within organization",
  },
  {
    level: "org",
    resource: "team_member",
    action: "update",
    description: "Update team members within organization",
  },
  {
    level: "org",
    resource: "team_member",
    action: "delete",
    description: "Delete team members from organization",
  },
  // User management within organization
  {
    level: "org",
    resource: "user",
    action: "manage",
    description: "Full user management within organization",
  },
  {
    level: "org",
    resource: "user",
    action: "read",
    description: "View users within organization",
  },
  {
    level: "org",
    resource: "user",
    action: "list",
    description: "List all users in organization",
  },
  {
    level: "org",
    resource: "user",
    action: "create",
    description: "Create new users in organization",
  },
  {
    level: "org",
    resource: "user",
    action: "update",
    description: "Update users within organization",
  },
  {
    level: "org",
    resource: "user",
    action: "delete",
    description: "Delete users from organization",
  },
  // Role management within organization
  {
    level: "org",
    resource: "role",
    action: "read",
    description: "View roles within organization",
  },
  {
    level: "org",
    resource: "role",
    action: "list",
    description: "List all roles in organization",
  },
  {
    level: "org",
    resource: "role",
    action: "create",
    description: "Create custom roles in organization",
  },
  {
    level: "org",
    resource: "role",
    action: "update",
    description: "Update roles within organization",
  },
  {
    level: "org",
    resource: "role",
    action: "delete",
    description: "Delete roles from organization",
  },
  {
    level: "org",
    resource: "role",
    action: "manage",
    description: "Full role management within organization",
  },
  // org permission permissions
  {
    level: "org",
    resource: "permission",
    action: "read",
    description: "View permissions within organization",
  },
  {
    level: "org",
    resource: "permission",
    action: "list",
    description: "List all permissions in organization",
  },
  {
    level: "org",
    resource: "permission",
    action: "manage",
    description: "Full permission management within organization",
  },
  {
    level: "org",
    resource: "permission",
    action: "update",
    description: "Update roles within organization",
  },
  {
    level: "org",
    resource: "permission",
    action: "delete",
    description: "Delete roles within organization",
  },
  // schedule permissions
  {
    level: "org",
    resource: "schedule",
    action: "manage",
    description: "Full schedule management within organization",
  },
  {
    level: "org",
    resource: "schedule",
    action: "create",
    description: "Create schedule from organization",
  },
  {
    level: "org",
    resource: "schedule",
    action: "read",
    description: "View schedules within organization",
  },
  {
    level: "org",
    resource: "schedule",
    action: "list",
    description: "List all schedules in organization",
  },
  {
    level: "org",
    resource: "schedule",
    action: "update",
    description: "Update schedules within organization",
  },
  {
    level: "org",
    resource: "schedule",
    action: "delete",
    description: "Delete schedules from organization",
  },
  // org customer permissions
  {
    level: "org",
    resource: "customer",
    action: "manage",
    description: "Full customer management within organization",
  },
  {
    level: "org",
    resource: "customer",
    action: "create",
    description: "Create customer from organization",
  },
  {
    level: "org",
    resource: "customer",
    action: "read",
    description: "View customers within organization",
  },
  {
    level: "org",
    resource: "customer",
    action: "list",
    description: "List customers within organization",
  },
  {
    level: "org",
    resource: "customer",
    action: "update",
    description: "Update customers within organization",
  },
  {
    level: "org",
    resource: "customer",
    action: "delete",
    description: "Delete customers from organization",
  },
];

const orgFinancialPermissions: CreatePermissionType[] = [
  // invoice permissions
  {
    level: "org",
    resource: "invoice",
    action: "manage",
    description: "Full invoice management within organization",
  },
  {
    level: "org",
    resource: "invoice",
    action: "create",
    description: "Create invoice from organization",
  },
  {
    level: "org",
    resource: "invoice",
    action: "read",
    description: "View invoices within organization",
  },
  {
    level: "org",
    resource: "invoice",
    action: "list",
    description: "List invoices within organization",
  },
  {
    level: "org",
    resource: "invoice",
    action: "update",
    description: "Update invoices within organization",
  },
  {
    level: "org",
    resource: "invoice",
    action: "delete",
    description: "Delete invoices from organization",
  },
  // payment permissions
  {
    level: "org",
    resource: "payment",
    action: "manage",
    description: "Full payment management within organization",
  },
  {
    level: "org",
    resource: "payment",
    action: "create",
    description: "Create payment from organization",
  },
  {
    level: "org",
    resource: "payment",
    action: "read",
    description: "View payments within organization",
  },
  {
    level: "org",
    resource: "payment",
    action: "list",
    description: "List payments within organization",
  },
  {
    level: "org",
    resource: "payment",
    action: "update",
    description: "Update payments within organization",
  },
  {
    level: "org",
    resource: "payment",
    action: "delete",
    description: "Delete payments from organization",
  },
  // billing permissions
  {
    level: "org",
    resource: "billing",
    action: "manage",
    description: "Full billing management within organization",
  },
  {
    level: "org",
    resource: "billing",
    action: "create",
    description: "Create billing from organization",
  },
  {
    level: "org",
    resource: "billing",
    action: "read",
    description: "View billings within organization",
  },
  {
    level: "org",
    resource: "billing",
    action: "list",
    description: "List all billings in organization",
  },
  {
    level: "org",
    resource: "billing",
    action: "update",
    description: "Update billings within organization",
  },
  {
    level: "org",
    resource: "billing",
    action: "delete",
    description: "Delete billings from organization",
  },
  // report permissions
  {
    level: "org",
    resource: "report",
    action: "manage",
    description: "Full report management within organization",
  },
  {
    level: "org",
    resource: "report",
    action: "create",
    description: "Create report from organization",
  },
  {
    level: "org",
    resource: "report",
    action: "read",
    description: "View reports within organization",
  },
  {
    level: "org",
    resource: "report",
    action: "list",
    description: "List all reports in organization",
  },
  {
    level: "org",
    resource: "report",
    action: "update",
    description: "Update reports within organization",
  },
  {
    level: "org",
    resource: "report",
    action: "delete",
    description: "Delete reports from organization",
  },
];

const orgJobPermissions: CreatePermissionType[] = [
  {
    level: "org",
    resource: "job",
    action: "manage",
    description: "Full job management within organization",
  },
  {
    level: "org",
    resource: "job",
    action: "create",
    description: "Create job from organization",
  },
  {
    level: "org",
    resource: "job",
    action: "read",
    description: "View jobs within organization",
  },
  {
    level: "org",
    resource: "job",
    action: "list",
    description: "List all jobs in organization",
  },
  {
    level: "org",
    resource: "job",
    action: "update",
    description: "Update jobs within organization",
  },
  {
    level: "org",
    resource: "job",
    action: "delete",
    description: "Delete jobs from organization",
  },
  // job category permissions
  {
    level: "org",
    resource: "job_category",
    action: "manage",
    description: "Full job category management within organization",
  },
  {
    level: "org",
    resource: "job_category",
    action: "create",
    description: "Create job category from organization",
  },
  {
    level: "org",
    resource: "job_category",
    action: "read",
    description: "View job categories within organization",
  },
  {
    level: "org",
    resource: "job_category",
    action: "list",
    description: "List all job categories in organization",
  },
  {
    level: "org",
    resource: "job_category",
    action: "update",
    description: "Update job categories within organization",
  },
  {
    level: "org",
    resource: "job_category",
    action: "delete",
    description: "Delete job categories from organization",
  },
  // job material permissions
  {
    level: "org",
    resource: "job_material",
    action: "manage",
    description: "Full job material management within organization",
  },
  {
    level: "org",
    resource: "job_material",
    action: "create",
    description: "Create job material from organization",
  },
  {
    level: "org",
    resource: "job_material",
    action: "read",
    description: "View job materials within organization",
  },
  {
    level: "org",
    resource: "job_material",
    action: "list",
    description: "List all job materials in organization",
  },
  {
    level: "org",
    resource: "job_material",
    action: "update",
    description: "Update job materials within organization",
  },
  {
    level: "org",
    resource: "job_material",
    action: "delete",
    description: "Delete job materials from organization",
  },
  // job revenue permissions
  {
    level: "org",
    resource: "job_revenue",
    action: "manage",
    description: "Full job revenue management within organization",
  },
  {
    level: "org",
    resource: "job_revenue",
    action: "read",
    description: "View job revenues within organization",
  },
  {
    level: "org",
    resource: "job_revenue",
    action: "list",
    description: "List all job revenues in organization",
  },
  {
    level: "org",
    resource: "job_revenue",
    action: "update",
    description: "Update job revenues within organization",
  },
  // job assignment permissions
  {
    level: "org",
    resource: "job_assignment",
    action: "manage",
    description: "Full job assignment management within organization",
  },
  {
    level: "org",
    resource: "job_assignment",
    action: "create",
    description: "Create job assignment from organization",
  },
  {
    level: "org",
    resource: "job_assignment",
    action: "read",
    description: "View job assignments within organization",
  },
  {
    level: "org",
    resource: "job_assignment",
    action: "list",
    description: "List all job assignments in organization",
  },
  {
    level: "org",
    resource: "job_assignment",
    action: "update",
    description: "Update job assignments within organization",
  },
  {
    level: "org",
    resource: "job_assignment",
    action: "delete",
    description: "Delete job assignments from organization",
  },
  // job attachment permissions
  {
    level: "org",
    resource: "job_attachment",
    action: "manage",
    description: "Full job attachment management within organization",
  },
  {
    level: "org",
    resource: "job_attachment",
    action: "create",
    description: "Create job attachment from organization",
  },
  {
    level: "org",
    resource: "job_attachment",
    action: "read",
    description: "View job attachments within organization",
  },
  {
    level: "org",
    resource: "job_attachment",
    action: "list",
    description: "List all job attachments in organization",
  },
  {
    level: "org",
    resource: "job_attachment",
    action: "update",
    description: "Update job attachments within organization",
  },
  {
    level: "org",
    resource: "job_attachment",
    action: "delete",
    description: "Delete job attachments from organization",
  },
  // job note permissions
  {
    level: "org",
    resource: "job_note",
    action: "manage",
    description: "Full job note management within organization",
  },
  {
    level: "org",
    resource: "job_note",
    action: "create",
    description: "Create job note from organization",
  },
  {
    level: "org",
    resource: "job_note",
    action: "read",
    description: "View job notes within organization",
  },
  {
    level: "org",
    resource: "job_note",
    action: "list",
    description: "List all job notes in organization",
  },
  {
    level: "org",
    resource: "job_note",
    action: "update",
    description: "Update job notes within organization",
  },
  {
    level: "org",
    resource: "job_note",
    action: "delete",
    description: "Delete job notes from organization",
  },
  // job invoice permissions
  {
    level: "org",
    resource: "job_invoice",
    action: "manage",
    description: "Full job invoice management within organization",
  },
  {
    level: "org",
    resource: "job_invoice",
    action: "create",
    description: "Create job invoice from organization",
  },
  {
    level: "org",
    resource: "job_invoice",
    action: "read",
    description: "View job invoices within organization",
  },
  {
    level: "org",
    resource: "job_invoice",
    action: "list",
    description: "List all job invoices in organization",
  },
  {
    level: "org",
    resource: "job_invoice",
    action: "update",
    description: "Update job invoices within organization",
  },
  {
    level: "org",
    resource: "job_invoice",
    action: "delete",
    description: "Delete job invoices from organization",
  },
  // job payment permissions
  {
    level: "org",
    resource: "job_payment",
    action: "manage",
    description: "Full job payment management within organization",
  },
  {
    level: "org",
    resource: "job_payment",
    action: "create",
    description: "Create job payment from organization",
  },
  {
    level: "org",
    resource: "job_payment",
    action: "read",
    description: "View job payments within organization",
  },
  {
    level: "org",
    resource: "job_payment",
    action: "list",
    description: "List all job payments in organization",
  },
  {
    level: "org",
    resource: "job_payment",
    action: "update",
    description: "Update job payments within organization",
  },
  {
    level: "org",
    resource: "job_payment",
    action: "delete",
    description: "Delete job payments from organization",
  },
  // job billing permissions
  {
    level: "org",
    resource: "job_billing",
    action: "manage",
    description: "Full job billing management within organization",
  },
  {
    level: "org",
    resource: "job_billing",
    action: "create",
    description: "Create job billing from organization",
  },
  {
    level: "org",
    resource: "job_billing",
    action: "read",
    description: "View job billings within organization",
  },
  {
    level: "org",
    resource: "job_billing",
    action: "list",
    description: "List all job billings in organization",
  },
  {
    level: "org",
    resource: "job_billing",
    action: "update",
    description: "Update job billings within organization",
  },
  {
    level: "org",
    resource: "job_billing",
    action: "delete",
    description: "Delete job billings from organization",
  },
  // job estimate permissions
  {
    level: "org",
    resource: "job_estimate",
    action: "manage",
    description: "Full job estimate management within organization",
  },
  {
    level: "org",
    resource: "job_estimate",
    action: "create",
    description: "Create job estimate from organization",
  },
  {
    level: "org",
    resource: "job_estimate",
    action: "read",
    description: "View job estimates within organization",
  },
  {
    level: "org",
    resource: "job_estimate",
    action: "list",
    description: "List all job estimates in organization",
  },
  {
    level: "org",
    resource: "job_estimate",
    action: "update",
    description: "Update job estimates within organization",
  },
  {
    level: "org",
    resource: "job_estimate",
    action: "delete",
    description: "Delete job estimates from organization",
  },
  // job time entry permissions
  {
    level: "org",
    resource: "job_time_entry",
    action: "manage",
    description: "Full job time entry management within organization",
  },
  {
    level: "org",
    resource: "job_time_entry",
    action: "create",
    description: "Create job time entry from organization",
  },
  {
    level: "org",
    resource: "job_time_entry",
    action: "read",
    description: "View job time entries within organization",
  },
  {
    level: "org",
    resource: "job_time_entry",
    action: "list",
    description: "List all job time entries in organization",
  },
  {
    level: "org",
    resource: "job_time_entry",
    action: "update",
    description: "Update job time entries within organization",
  },
  {
    level: "org",
    resource: "job_time_entry",
    action: "delete",
    description: "Delete job time entries from organization",
  },
];

const orgLeadPermissions: CreatePermissionType[] = [
  // lead permissions
  {
    level: "org",
    resource: "lead",
    action: "manage",
    description: "Full leads management within organization",
  },
  {
    level: "org",
    resource: "lead",
    action: "create",
    description: "Create lead from organization",
  },
  {
    level: "org",
    resource: "lead",
    action: "read",
    description: "View leads within organization",
  },
  {
    level: "org",
    resource: "lead",
    action: "list",
    description: "List all leads in organization",
  },
  {
    level: "org",
    resource: "lead",
    action: "update",
    description: "Update leads within organization",
  },
  {
    level: "org",
    resource: "lead",
    action: "delete",
    description: "Delete leads from organization",
  },
  // lead attachment permissions
  {
    level: "org",
    resource: "lead_attachment",
    action: "manage",
    description: "Full lead attachment management within organization",
  },
  {
    level: "org",
    resource: "lead_attachment",
    action: "create",
    description: "Create lead attachment from organization",
  },
  {
    level: "org",
    resource: "lead_attachment",
    action: "read",
    description: "View lead attachments within organization",
  },
  {
    level: "org",
    resource: "lead_attachment",
    action: "list",
    description: "List all lead attachments in organization",
  },
  {
    level: "org",
    resource: "lead_attachment",
    action: "update",
    description: "Update lead attachments within organization",
  },
  {
    level: "org",
    resource: "lead_attachment",
    action: "delete",
    description: "Delete lead attachments from organization",
  },
  // lead note permissions
  {
    level: "org",
    resource: "lead_note",
    action: "manage",
    description: "Full lead note management within organization",
  },
  {
    level: "org",
    resource: "lead_note",
    action: "create",
    description: "Create lead note from organization",
  },
  {
    level: "org",
    resource: "lead_note",
    action: "read",
    description: "View lead notes within organization",
  },
  {
    level: "org",
    resource: "lead_note",
    action: "list",
    description: "List all lead notes in organization",
  },
  {
    level: "org",
    resource: "lead_note",
    action: "update",
    description: "Update lead notes within organization",
  },
  {
    level: "org",
    resource: "lead_note",
    action: "delete",
    description: "Delete lead notes from organization",
  },
  // lead category permissions
  {
    level: "org",
    resource: "lead_category",
    action: "manage",
    description: "Full lead category management within organization",
  },
  {
    level: "org",
    resource: "lead_category",
    action: "create",
    description: "Create lead category from organization",
  },
  {
    level: "org",
    resource: "lead_category",
    action: "read",
    description: "View lead categories within organization",
  },
  {
    level: "org",
    resource: "lead_category",
    action: "list",
    description: "List all lead categories in organization",
  },
  {
    level: "org",
    resource: "lead_category",
    action: "update",
    description: "Update lead categories within organization",
  },
  {
    level: "org",
    resource: "lead_category",
    action: "delete",
    description: "Delete lead categories from organization",
  },
  // lead invoice permissions
  {
    level: "org",
    resource: "lead_invoice",
    action: "manage",
    description: "Full lead invoice management within organization",
  },
  {
    level: "org",
    resource: "lead_invoice",
    action: "create",
    description: "Create lead invoice from organization",
  },
  {
    level: "org",
    resource: "lead_invoice",
    action: "read",
    description: "View lead invoices within organization",
  },
  {
    level: "org",
    resource: "lead_invoice",
    action: "list",
    description: "List all lead invoices in organization",
  },
  {
    level: "org",
    resource: "lead_invoice",
    action: "update",
    description: "Update lead invoices within organization",
  },
  {
    level: "org",
    resource: "lead_invoice",
    action: "delete",
    description: "Delete lead invoices from organization",
  },
  // lead payment permissions
  {
    level: "org",
    resource: "lead_payment",
    action: "manage",
    description: "Full lead payment management within organization",
  },
  {
    level: "org",
    resource: "lead_payment",
    action: "create",
    description: "Create lead payment from organization",
  },
  {
    level: "org",
    resource: "lead_payment",
    action: "read",
    description: "View lead payments within organization",
  },
  {
    level: "org",
    resource: "lead_payment",
    action: "list",
    description: "List all lead payments in organization",
  },
  {
    level: "org",
    resource: "lead_payment",
    action: "update",
    description: "Update lead payments within organization",
  },
  {
    level: "org",
    resource: "lead_payment",
    action: "delete",
    description: "Delete lead payments from organization",
  },
  // lead billing permissions
  {
    level: "org",
    resource: "lead_billing",
    action: "manage",
    description: "Full lead billing management within organization",
  },
  {
    level: "org",
    resource: "lead_billing",
    action: "create",
    description: "Create lead billing from organization",
  },
  {
    level: "org",
    resource: "lead_billing",
    action: "read",
    description: "View lead billings within organization",
  },
  {
    level: "org",
    resource: "lead_billing",
    action: "list",
    description: "List all lead billings in organization",
  },
  {
    level: "org",
    resource: "lead_billing",
    action: "update",
    description: "Update lead billings within organization",
  },
  {
    level: "org",
    resource: "lead_billing",
    action: "delete",
    description: "Delete lead billings from organization",
  },
  // lead report permissions
  {
    level: "org",
    resource: "lead_report",
    action: "manage",
    description: "Full lead report management within organization",
  },
  {
    level: "org",
    resource: "lead_report",
    action: "create",
    description: "Create lead report from organization",
  },
  {
    level: "org",
    resource: "lead_report",
    action: "read",
    description: "View lead reports within organization",
  },
  {
    level: "org",
    resource: "lead_report",
    action: "list",
    description: "List all lead reports in organization",
  },
  {
    level: "org",
    resource: "lead_report",
    action: "update",
    description: "Update lead reports within organization",
  },
  {
    level: "org",
    resource: "lead_report",
    action: "delete",
    description: "Delete lead reports from organization",
  },
  // lead estimate permissions
  {
    level: "org",
    resource: "lead_estimate",
    action: "manage",
    description: "Full lead estimate management within organization",
  },
  {
    level: "org",
    resource: "lead_estimate",
    action: "create",
    description: "Create lead estimate from organization",
  },
  {
    level: "org",
    resource: "lead_estimate",
    action: "read",
    description: "View lead estimates within organization",
  },
  {
    level: "org",
    resource: "lead_estimate",
    action: "list",
    description: "List all lead estimates in organization",
  },
  {
    level: "org",
    resource: "lead_estimate",
    action: "update",
    description: "Update lead estimates within organization",
  },
  {
    level: "org",
    resource: "lead_estimate",
    action: "delete",
    description: "Delete lead estimates from organization",
  },
];

export const permissionsData: CreatePermissionType[] = [
  ...selfPermissions,
  ...systemPermissions,
  ...orgPermissions,
  ...orgFinancialPermissions,
  ...orgLeadPermissions,
  ...orgJobPermissions,
];

export async function seedPermission(): Promise<Array<PermissionDataModel>> {
  console.log("🌱 Seeding permissions...");

  const permissions = await db
    .insert(PermissionTable)
    .values(
      permissionsData.map((p) => ({
        ...p,
        name: `${p.level}${separator}${p.resource}${separator}${p.action}` as PermissionType,
        level: p.level as PermissionLevelEnumType,
        resource: p.resource as ResourceTypeEnumType,
        action: p.action as ActionTypeEnumType,
      }))
    )
    .returning();

  console.log(`✅ ${permissions.length} Permissions seeded`);
  return permissions;
}
