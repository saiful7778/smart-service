import {
  PermissionDataModel,
  RoleDataModel,
  RolePermissionDataModel,
  RolePermissionTable,
} from "../schemas";
import { RoleEnumType, RoleTypeEnumType } from "../schemas/enums/zod-db-enums";
import { PermissionType } from "./permission.seed";
import { db } from "./seed-db-client";

export const rolesAndPermissionData: Array<{
  roleName: RoleEnumType;
  type: RoleTypeEnumType;
  permissions: Array<PermissionType>;
}> = [
  // ==================== SYSTEM ROLES ====================
  {
    roleName: "USER",
    type: "SYSTEM",
    permissions: [
      // Can manage their own profile and create/join organizations
      "self.user.read",
      "self.user.update",
      "self.org.create",
      "self.org.list",
      "self.invitation.list",
      "self.invitation.update", // Accept/decline invites
    ],
  },
  {
    roleName: "SYSTEM_SUPPORT_AGENT",
    type: "SYSTEM",
    permissions: [
      // Self permissions
      "self.user.read",
      "self.user.update",

      // Cross-org read-only user/org support
      "system.org.list",
      "system.org.read",
      "system.user.read",
      "system.user.list",
    ],
  },
  {
    roleName: "SYSTEM_ADMIN",
    type: "SYSTEM",
    permissions: [
      // Self permissions
      "self.user.read",
      "self.user.update",

      // System organization management
      "system.org.list",
      "system.org.read",
      "system.org.update",

      // System user management
      "system.user.read",
      "system.user.list",
      "system.user.update",
      "system.user.delete",

      // System role & permission management
      "system.role.read",
      "system.role.list",
      "system.role.update",
      "system.permission.read",
      "system.permission.list",

      // System financials & reports
      "system.invoice.manage",
      "system.payment.manage",
      "system.billing.manage",
      "system.report.manage",
      "system.report.export",
    ],
  },
  {
    roleName: "SUPER_ADMIN",
    type: "SYSTEM",
    permissions: [
      "self.user.read",
      "self.user.update",

      // Full system control (manage bypasses specific actions)
      "system.user.manage",
      "system.org.manage",
      "system.role.manage",
      "system.permission.manage",
      "system.invoice.manage",
      "system.payment.manage",
      "system.billing.manage",
      "system.report.manage",
    ],
  },

  // ==================== ORGANIZATION ROLES ====================
  {
    roleName: "MEMBER",
    type: "ORG",
    permissions: [
      // Basic directory access
      "org.user.read",
      "org.user.list",
      "org.team.list",
      "org.team.read",
    ],
  },
  {
    roleName: "STAFF", // Field Technician / Worker
    type: "ORG",
    permissions: [
      // Directory
      "org.user.read",
      "org.user.list",
      "org.team.list",
      "org.team.read",

      // Customers (Read only)
      "org.customer.list",
      "org.customer.read",

      // Jobs (Read/Update status/notes, no create/delete)
      "org.job.list",
      "org.job.read",
      "org.job.update",
      "org.job_attachment.create",
      "org.job_attachment.read",
      "org.job_note.create",
      "org.job_note.read",
      "org.job_time_entry.create", // Clock in/out
      "org.job_time_entry.read",
      "org.job_time_entry.update", // Update active timer

      // Leads (Read only, add notes)
      "org.lead.list",
      "org.lead.read",
      "org.lead_note.create",
      "org.lead_note.read",

      // Schedules (Read only to see own calendar)
      "org.schedule.list",
      "org.schedule.read",

      // Materials (Read only)
      "org.material.list",
      "org.material.read",
    ],
  },
  {
    roleName: "DISPATCHER", // Office Scheduler
    type: "ORG",
    permissions: [
      // Directory
      "org.user.read",
      "org.user.list",
      "org.team.list",
      "org.team.read",

      // Customers (Create/Read for job booking)
      "org.customer.create",
      "org.customer.list",
      "org.customer.read",
      "org.customer.update",

      // Leads (Full operational control)
      "org.lead.create",
      "org.lead.list",
      "org.lead.read",
      "org.lead.update",
      "org.lead_category.manage",
      "org.lead_attachment.manage",
      "org.lead_note.manage",
      "org.lead_estimate.manage",

      // Jobs (Full operational control)
      "org.job.create",
      "org.job.list",
      "org.job.read",
      "org.job.update",
      "org.job_category.manage",
      "org.job_assignment.manage", // Assigning people
      "org.job_attachment.manage",
      "org.job_note.manage",
      "org.job_material.manage",
      "org.job_estimate.manage",
      "org.job_time_entry.manage", // Manage timesheets

      // Schedules (Full control - core dispatcher duty)
      "org.schedule.manage",

      // Materials (Read/Update stock)
      "org.material.list",
      "org.material.read",
      "org.material.update",
    ],
  },
  {
    roleName: "TEAM_LEAD", // Senior Field Staff
    type: "ORG",
    permissions: [
      // Directory & Team
      "org.user.read",
      "org.user.list",
      "org.team.manage", // Manage their specific team
      "org.team_member.manage",

      // Customers
      "org.customer.list",
      "org.customer.read",
      "org.customer.update",

      // Leads
      "org.lead.list",
      "org.lead.read",
      "org.lead.update",
      "org.lead_attachment.manage",
      "org.lead_note.manage",
      "org.lead_estimate.manage",

      // Jobs (Manage operations & revenues)
      "org.job.list",
      "org.job.read",
      "org.job.update",
      "org.job_category.manage",
      "org.job_assignment.manage",
      "org.job_attachment.manage",
      "org.job_note.manage",
      "org.job_material.manage", // Approve material usage
      "org.job_revenue.manage", // Update revenues
      "org.job_estimate.manage",
      "org.job_time_entry.manage", // Approve team timesheets

      // Schedules
      "org.schedule.manage",

      // Materials
      "org.material.list",
      "org.material.read",
      "org.material.update",
    ],
  },
  {
    roleName: "ORG_SUPPORT_AGENT", // Internal Helpdesk
    type: "ORG",
    permissions: [
      // Read-only access across the board for troubleshooting
      "org.user.read",
      "org.user.list",
      "org.team.list",
      "org.team.read",

      "org.customer.list",
      "org.customer.read",

      "org.lead.list",
      "org.lead.read",
      "org.lead_note.create", // Can add internal support notes
      "org.lead_invoice.list",
      "org.lead_invoice.read",

      "org.job.list",
      "org.job.read",
      "org.job_assignment.list",
      "org.job_assignment.read",
      "org.job_note.create",
      "org.job_revenue.list",
      "org.job_revenue.read",
      "org.job_estimate.list",
      "org.job_estimate.read",

      "org.schedule.list",
      "org.schedule.read",

      "org.invoice.list",
      "org.invoice.read",
      "org.payment.list",
      "org.payment.read",

      "org.invitation.list",
      "org.invitation.read",
    ],
  },
  {
    roleName: "MANAGER", // Business Operations Manager
    type: "ORG",
    permissions: [
      // Directory
      "org.user.read",
      "org.user.list",
      "org.user.update", // Update staff details
      "org.team.manage",

      // Customers (Full control)
      "org.customer.manage",

      // Leads (Full control)
      "org.lead.manage",
      "org.lead_category.manage",
      "org.lead_attachment.manage",
      "org.lead_note.manage",
      "org.lead_invoice.manage",
      "org.lead_payment.manage",
      "org.lead_billing.read",
      "org.lead_estimate.manage",

      // Jobs (Full control)
      "org.job.manage",
      "org.job_category.manage",
      "org.job_assignment.manage",
      "org.job_attachment.manage",
      "org.job_material.manage",
      "org.job_note.manage",
      "org.job_revenue.manage",
      "org.job_invoice.manage",
      "org.job_payment.manage",
      "org.job_billing.read",
      "org.job_estimate.manage",
      "org.job_time_entry.manage",

      // Materials (Full control)
      "org.material.manage",

      // Schedules (Full control)
      "org.schedule.manage",

      // Financials (Create invoices, record payments, no deep billing delete)
      "org.invoice.create",
      "org.invoice.list",
      "org.invoice.read",
      "org.invoice.update",
      "org.invoice.export",
      "org.payment.create",
      "org.payment.list",
      "org.payment.read",

      // Reports
      "org.report.read",
      "org.report.list",
      "org.report.export",

      // Invitations
      "org.invitation.manage",
    ],
  },
  {
    roleName: "ORG_ADMIN", // IT / Org Setup Admin
    type: "ORG",
    permissions: [
      // Org Settings & RBAC (Core Admin Duties)
      "org.org.read",
      "org.org.update",
      "org.role.manage",
      "org.permission.manage",
      "org.billing.manage", // Manage subscriptions

      // User Management
      "org.user.manage",
      "org.team.manage",
      "org.invitation.manage",

      // Operational Access (Delegate to Managers, but has full access)
      "org.customer.manage",
      "org.lead.manage",
      "org.lead_category.manage",
      "org.lead_attachment.manage",
      "org.lead_note.manage",
      "org.lead_invoice.manage",
      "org.lead_payment.manage",
      "org.lead_billing.manage",
      "org.lead_estimate.manage",

      "org.job.manage",
      "org.job_category.manage",
      "org.job_assignment.manage",
      "org.job_attachment.manage",
      "org.job_material.manage",
      "org.job_note.manage",
      "org.job_revenue.manage",
      "org.job_invoice.manage",
      "org.job_payment.manage",
      "org.job_billing.manage",
      "org.job_estimate.manage",
      "org.job_time_entry.manage",

      "org.material.manage",
      "org.schedule.manage",
      "org.invoice.manage",
      "org.payment.manage",
      "org.report.manage",
    ],
  },
  {
    roleName: "OWNER", // Organization Owner
    type: "ORG",
    permissions: [
      // Absolute Org Control
      "org.org.manage", // Danger zone: delete org, change slug

      // RBAC & Users
      "org.user.manage",
      "org.team.manage",
      "org.role.manage",
      "org.permission.manage",
      "org.invitation.manage",

      // Full Business Operations
      "org.customer.manage",
      "org.lead.manage",
      "org.lead_category.manage",
      "org.lead_attachment.manage",
      "org.lead_note.manage",
      "org.lead_invoice.manage",
      "org.lead_payment.manage",
      "org.lead_billing.manage",
      "org.lead_estimate.manage",
      "org.lead_report.manage",

      "org.job.manage",
      "org.job_category.manage",
      "org.job_assignment.manage",
      "org.job_attachment.manage",
      "org.job_material.manage",
      "org.job_note.manage",
      "org.job_revenue.manage",
      "org.job_invoice.manage",
      "org.job_payment.manage",
      "org.job_billing.manage",
      "org.job_estimate.manage",
      "org.job_time_entry.manage",

      "org.material.manage",
      "org.schedule.manage",
      "org.invoice.manage",
      "org.payment.manage",
      "org.billing.manage",
      "org.report.manage",
    ],
  },
];

export async function seedRolePermission(
  roles: Array<RoleDataModel>,
  permissions: Array<PermissionDataModel>
): Promise<Array<RolePermissionDataModel>> {
  console.log("🌱 Seeding role permissions...");

  const rolesAndPermissions = await db
    .insert(RolePermissionTable)
    .values(
      rolesAndPermissionData.flatMap((r) => {
        const role = roles.find(
          ({ roleName, type }) => roleName === r.roleName && type === r.type // ← match both
        );

        if (!role) return [];

        const permissionsForRole = permissions
          .filter(({ name }) => r.permissions.includes(name as PermissionType))
          .map(({ id }) => ({
            roleId: role.id,
            permissionId: id,
          }));

        console.log(
          `📝 Assigning ${permissionsForRole.length} permissions to ${r.roleName}`
        );

        return permissionsForRole;
      })
    )
    .returning();

  console.log(`✅ ${rolesAndPermissions.length} Role permissions seeded`);
  return rolesAndPermissions;
}
