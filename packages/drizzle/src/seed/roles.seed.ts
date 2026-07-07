import { InsertRole, RoleDataModel, RoleTable } from "../schemas";
import { RoleEnumSchema } from "../schemas/enums/zod-db-enums";
import { db } from "./seed-db-client";

export const SYSTEM_ROLES = [
  RoleEnumSchema.enum.USER,
  RoleEnumSchema.enum.SYSTEM_SUPPORT_AGENT,
  RoleEnumSchema.enum.SYSTEM_ADMIN,
  RoleEnumSchema.enum.SUPER_ADMIN,
] as readonly string[];

export const rolesData: Array<InsertRole> = [
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
];

export async function seedRoles(): Promise<Array<RoleDataModel>> {
  console.log("🌱 Seeding roles...");

  const roles = await db.insert(RoleTable).values(rolesData).returning();

  console.log(`✅ ${roles.length} Roles seeded`);
  return roles;
}
