import { sql } from "drizzle-orm";
import z from "zod";

import {
  OrganizationMemberTable,
  RoleDataModel,
  RoleTable,
  selectRoleSchema,
  selectUserSchema,
  UserTable,
} from "@workspace/drizzle/schemas";

export const roleColumnSql = sql<
  Array<Pick<RoleDataModel, "type" | "roleName" | "customRoleName" | "id">>
>`COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
    'id', ${RoleTable.id},
    'type', ${RoleTable.type},
    'roleName', ${RoleTable.roleName},
    'customRoleName', ${RoleTable.customRoleName}
  )) FILTER (WHERE ${RoleTable.id} IS NOT NULL), '[]')`.as("roles");

export const roleSqlSchema = selectRoleSchema.pick({
  id: true,
  type: true,
  roleName: true,
  customRoleName: true,
});

export const userProfileColumns = {
  userId: UserTable.id,
  orgMemberId: OrganizationMemberTable.id,
  name: UserTable.name,
  email: UserTable.email,
  image: UserTable.image,
  roles: roleColumnSql,
};

export const userProfileSchema = selectUserSchema
  .pick({
    name: true,
    email: true,
    image: true,
  })
  .extend({
    userId: z.uuid(),
    orgMemberId: z.uuid(),
    roles: z.array(roleSqlSchema),
  });
export type UserProfileType = z.infer<typeof userProfileSchema>;
