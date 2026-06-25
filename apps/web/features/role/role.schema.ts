import z from "zod";

export const createOrUpdateOrgRoleSchema = z.object({
  roleName: z
    .string()
    .min(1, "Role name is required")
    .max(255, "Role name is too long")
    .regex(/^[A-Za-z\s]+$/, "Role name can only contain letters")
    .transform((value) => value.toLowerCase()),
  description: z.string().optional(),
  permissions: z
    .array(z.uuid().min(1, "Permission is required"))
    .min(1, "At least one permission is required"),
});
export type CreateOrUpdateOrgRoleType = z.infer<
  typeof createOrUpdateOrgRoleSchema
>;
