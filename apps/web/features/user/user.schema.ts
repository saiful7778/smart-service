import z from "zod";

import { RoleEnumSchema } from "@workspace/drizzle/zod-db-enums";

export const userUpdateSchema = z.object({
  displayRole: z.string().nullable(),
  role: RoleEnumSchema,
});
export type UserUpdateType = z.infer<typeof userUpdateSchema>;

export const roleUpdateSchema = z.object({
  userId: z.uuid(),
  roleNames: z.array(RoleEnumSchema),
});
export type RoleUpdateType = z.infer<typeof roleUpdateSchema>;
