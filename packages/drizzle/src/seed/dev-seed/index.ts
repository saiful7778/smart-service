import { clearAll } from "../clearAll";
import { seedPermission } from "../permission.seed";
import { seedRolePermission } from "../rolePermission.seed";
import { seedRoles } from "../roles.seed";
import { db } from "../seed-db-client";
import { seedAccounts } from "./account.seed";
import { seedAddress } from "./address.seed";
import { seedCustomer } from "./customer.seed";
import { seedFile } from "./file.seed";
import { seedJob } from "./job.seed";
import { seedLead } from "./lead.seed";
import { seedLeadAddress } from "./leadAddress.seed";
import { seedLeadAttachment } from "./leadAttachment.seed";
import { seedLeadCategory } from "./leadCategory.seed";
import { seedLeadCategoryJoin } from "./leadCategoryJoin.seed";
import { seedHistory } from "./leadHistory.seed";
import { seedOrganization } from "./organization.seed";
import { seedOrgMember } from "./orgMember.seed";
import { seedUsers } from "./user.seed";

async function main() {
  console.log("🌱 Starting database seed...\n");
  await clearAll(db);

  // Seed data
  const roles = await seedRoles();
  const permissions = await seedPermission();
  const rolesAndPermissions = await seedRolePermission(roles, permissions);
  const users = await seedUsers(roles);
  const accounts = await seedAccounts(users);

  const files = await seedFile();

  const addresses = await seedAddress();

  const orgs = await seedOrganization();
  const orgMembers = await seedOrgMember(orgs, users, roles);
  const leadCategories = await seedLeadCategory(orgs, orgMembers);

  const customers = await seedCustomer(orgMembers);
  const leads = await seedLead(customers);
  const jobs = await seedJob(leads, orgMembers);
  const leadCategoryJoins = await seedLeadCategoryJoin(leads, leadCategories);
  const leadAddresses = await seedLeadAddress(leads, addresses);
  const leadHistories = await seedHistory(leads);

  const leadAttachments = await seedLeadAttachment(leads, files);

  console.log("\n📊 Seed Summary:");

  console.log(`Roles and Permissions: ${rolesAndPermissions.length}`);
  console.log(`Users: ${users.length}`);
  console.log(`Accounts: ${accounts.length}`);
  console.log(`Files: ${files.length}`);
  console.log(`Organizations: ${orgs.length}`);
  console.log(`Org Members: ${orgMembers.length}`);
  console.log(`Lead Categories: ${leadCategories.length}`);
  console.log(`Addresses: ${addresses.length}`);
  console.log(`Leads: ${leads.length}`);
  console.log(`Jobs: ${jobs.length}`);
  console.log(`Lead Addresses: ${leadAddresses.length}`);
  console.log(`Lead Histories: ${leadHistories.length}`);
  console.log(`Lead Category Joins: ${leadCategoryJoins.length}`);
  console.log(`Lead Attachments: ${leadAttachments.length}`);

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  });
