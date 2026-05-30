import { InsertRole, RoleTable } from "../schemas";
import { RoleEnumSchema } from "../schemas/enums/zod-db-enums";
import { db } from "./seed-db-client";

export const SYSTEM_ROLES = [
  RoleEnumSchema.enum.USER,
  RoleEnumSchema.enum.SYSTEM_SUPPORT_AGENT,
  RoleEnumSchema.enum.SYSTEM_ADMIN,
  RoleEnumSchema.enum.SUPER_ADMIN,
] as readonly string[];

export const ORG_ROLES = [
  RoleEnumSchema.enum.MEMBER,
  RoleEnumSchema.enum.STAFF,
  RoleEnumSchema.enum.DISPATCHER,
  RoleEnumSchema.enum.TEAM_LEAD,
  RoleEnumSchema.enum.MANAGER,
  RoleEnumSchema.enum.ORG_SUPPORT_AGENT,
  RoleEnumSchema.enum.ORG_ADMIN,
  RoleEnumSchema.enum.OWNER,
] as readonly string[];

export const rolesData: Array<InsertRole> = [
  // System roles
  {
    roleName: RoleEnumSchema.enum.USER,
    type: "SYSTEM",
    description: "Regular user with basic self-management permissions",
  },
  {
    roleName: RoleEnumSchema.enum.SYSTEM_SUPPORT_AGENT,
    type: "SYSTEM",
    description: "System support agent",
  },
  {
    roleName: RoleEnumSchema.enum.SYSTEM_ADMIN,
    type: "SYSTEM",
    description: "System administrator with organization-level access",
  },
  {
    roleName: RoleEnumSchema.enum.SUPER_ADMIN,
    type: "SYSTEM",
    description: "Full system access",
  },

  // Organization roles
  {
    roleName: RoleEnumSchema.enum.MEMBER,
    type: "ORG",
    description: "Basic organization member",
  },
  {
    roleName: RoleEnumSchema.enum.STAFF,
    type: "ORG",
    description: "Organization staff member",
  },
  {
    roleName: RoleEnumSchema.enum.DISPATCHER,
    type: "ORG",
    description: "Organization dispatcher",
  },
  {
    roleName: RoleEnumSchema.enum.TEAM_LEAD,
    type: "ORG",
    description: "Organization team lead",
  },
  {
    roleName: RoleEnumSchema.enum.MANAGER,
    type: "ORG",
    description: "Organization manager",
  },
  {
    roleName: RoleEnumSchema.enum.ORG_SUPPORT_AGENT,
    type: "ORG",
    description: "Organization support agent",
  },
  {
    roleName: RoleEnumSchema.enum.ORG_ADMIN,
    type: "ORG",
    description: "Organization administrator",
  },
  {
    roleName: RoleEnumSchema.enum.OWNER,
    type: "ORG",
    description: "Organization owner with full org access",
  },
];

export async function seedRoles() {
  console.log("🌱 Seeding roles...");

  const roles = await db.insert(RoleTable).values(rolesData).returning();

  console.log(`✅ ${roles.length} Roles seeded`);
  return roles;
}
