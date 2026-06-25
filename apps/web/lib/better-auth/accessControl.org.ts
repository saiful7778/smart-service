import { createAccessControl } from "better-auth/plugins";
import { defaultStatements } from "better-auth/plugins/organization/access";

import { RoleEnumSchema } from "@workspace/drizzle/zod-db-enums";

const statement = {
  ...defaultStatements,
} as const;

export const orgAc = createAccessControl(statement);

export const orgRoles = {
  [RoleEnumSchema.enum.MEMBER]: orgAc.newRole({
    member: [],
    invitation: [],
    team: [],
    ac: ["read"],
  }),
  [RoleEnumSchema.enum.STAFF]: orgAc.newRole({
    member: [],
    invitation: [],
    team: [],
    ac: ["read"],
  }),
  [RoleEnumSchema.enum.DISPATCHER]: orgAc.newRole({
    member: [],
    invitation: [],
    team: [],
    ac: ["read"],
  }),
  [RoleEnumSchema.enum.TEAM_LEAD]: orgAc.newRole({
    member: [],
    invitation: [],
    team: [],
    ac: ["read"],
  }),
  [RoleEnumSchema.enum.MANAGER]: orgAc.newRole({
    member: [],
    invitation: [],
    team: [],
    ac: ["read"],
  }),
  [RoleEnumSchema.enum.ORG_SUPPORT_AGENT]: orgAc.newRole({
    member: [],
    invitation: [],
    team: [],
    ac: ["read"],
  }),
  [RoleEnumSchema.enum.ORG_ADMIN]: orgAc.newRole({
    organization: ["update"],
    member: ["create", "update"],
    invitation: ["create", "cancel"],
    team: ["create", "update"],
    ac: ["create", "read", "update", "delete"],
  }),
  [RoleEnumSchema.enum.OWNER]: orgAc.newRole({
    organization: ["delete", "update"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    team: ["create", "update", "delete"],
    ac: ["create", "read", "update", "delete"],
  }),
} as const;

export type PermissionStatement = typeof statement;
export type Resource = keyof PermissionStatement;
export type Action<T extends Resource> = PermissionStatement[T][number];
