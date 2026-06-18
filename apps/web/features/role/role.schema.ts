import z from "zod";

import { OrgRoleEnumSchema } from "@workspace/lib/utils";

export const createOrUpdateOrgRoleSchema = z.object({
  roleName: OrgRoleEnumSchema,
  customRoleName: z
    .string()
    .min(1, "Custom role name is required")
    .max(255, "Custom role name is too long"),
  description: z.string().optional(),
  permissions: z
    .array(z.uuid().min(1, "Permission id is required"))
    .min(1, "At least one permission is required"),
});
export type CreateOrUpdateOrgRoleType = z.infer<
  typeof createOrUpdateOrgRoleSchema
>;
