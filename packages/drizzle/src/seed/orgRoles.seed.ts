import { faker } from "@faker-js/faker";

import {
  InsertOrgRole,
  InsertRole,
  OrganizationDataModel,
  OrgRoleDataModel,
  OrgRoleTable,
  RoleDataModel,
  RoleTable,
} from "../schemas";
import { RoleEnumSchema } from "../schemas/enums/zod-db-enums";
import { db } from "./seed-db-client";

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

export async function seedOrgRoles(
  orgs: Array<OrganizationDataModel>
): Promise<{
  orgRoles: Array<OrgRoleDataModel>;
  orgSystemRoles: Array<RoleDataModel>;
}> {
  console.log("🌱 Seeding organization roles...");

  const orgSystemRoles = await db
    .insert(RoleTable)
    .values(rolesData)
    .returning();

  const orgRoleData: Array<InsertOrgRole> = orgs.map((org) => {
    return {
      organizationId: org.id,
      role: faker.person.jobTitle(),
      permission: "",
    } satisfies InsertOrgRole;
  });

  const orgRoles = await db
    .insert(OrgRoleTable)
    .values(orgRoleData)
    .returning();

  console.log(
    `✅ ${orgSystemRoles.length + orgRoles.length} Organization roles seeded`
  );
  return { orgSystemRoles, orgRoles };
}
