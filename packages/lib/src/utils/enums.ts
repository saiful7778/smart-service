import { z } from "zod";

export const OrgRoleEnumSchema = z.enum([
  "MEMBER",
  "STAFF",
  "DISPATCHER",
  "TEAM_LEAD",
  "MANAGER",
  "ORG_SUPPORT_AGENT",
  "ORG_ADMIN",
  "OWNER",
]);
export type OrgRoleType = z.infer<typeof OrgRoleEnumSchema>;

export const SystemRoleEnumSchema = z.enum([
  "USER",
  "SYSTEM_SUPPORT_AGENT",
  "SYSTEM_ADMIN",
  "SUPER_ADMIN",
]);
export type SystemRoleType = z.infer<typeof SystemRoleEnumSchema>;
