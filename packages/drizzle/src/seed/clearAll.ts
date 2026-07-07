import { DatabaseType } from "../drizzle-client";
import * as schema from "../schemas";

export async function clearAll(db: DatabaseType) {
  console.log("🧹 Clearing existing data...");
  await db.transaction(async (tx) => {
    await tx.delete(schema.LeadNoteTable);
    await tx.delete(schema.JobAssignmentTable);
    await tx.delete(schema.JobTable);
    await tx.delete(schema.LeadCategoryJoinTable);
    await tx.delete(schema.LeadAttachmentTable);
    await tx.delete(schema.LeadHistoryTable);
    await tx.delete(schema.LeadRevenueHistoryTable);
    await tx.delete(schema.LeadAddressTable);
    await tx.delete(schema.LeadTable);
    await tx.delete(schema.LeadCategoryTable);
    await tx.delete(schema.ContactSubmissionReplyTable);
    await tx.delete(schema.ContactSubmissionTable);
    await tx.delete(schema.OrgAddressTable);
    await tx.delete(schema.InvitationTable);
    await tx.delete(schema.OrgRoleMemberTable);
    await tx.delete(schema.OrgRoleTable);
    await tx.delete(schema.OrgMemberRoleTable);
    await tx.delete(schema.OrganizationMemberTable);
    await tx.delete(schema.OrganizationTable);
    await tx.delete(schema.AddressTable);
    await tx.delete(schema.UserRoleTable);
    await tx.delete(schema.RolePermissionTable);
    await tx.delete(schema.PermissionTable);
    await tx.delete(schema.RoleTable);
    await tx.delete(schema.FileTable);
    await tx.delete(schema.UserActivityTable);
    await tx.delete(schema.VerificationTable);
    await tx.delete(schema.AccountTable);
    await tx.delete(schema.SessionTable);
    await tx.delete(schema.UserTable);
  });
  console.log("🗑️  Cleared existing data \n");
}
