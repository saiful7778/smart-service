import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import {
  selectPermissionSchema,
  selectRoleSchema,
  selectUserSchema,
  updateUserSchema,
} from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
  SystemRoleEnumSchema,
} from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { baseContract } from "@/server/orpc.contract-base";

import { roleSqlSchema } from "../user.api-schema";
import { roleUpdateSchema } from "../user.schema";

const userBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.USER.NOT_FOUND,
  },
});

const tags = ["User"] as const;

const listUserContract = userBaseContract
  .route({
    path: "/users/list",
    description: "List of users",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectUserSchema>({
      searchFields: ["name", "email"],
      orderFields: ["name", "email", "createdAt", "updatedAt"],
      filter: z.object({
        roleName: z.array(SystemRoleEnumSchema).optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectUserSchema.extend({
          lastLogin: z.date().nullable(),
          roles: z.array(roleSqlSchema),
        })
      )
    )
  );
export type ListUserInput = InferContractRouterInputs<typeof listUserContract>;
export type ListUserOutput = InferContractRouterOutputs<
  typeof listUserContract
>["data"];

const userStatsContract = userBaseContract
  .route({
    method: "GET",
    path: "/users/stats",
    description: "Get stats",
    tags,
  })
  .output(
    apiOutputZodSchema(
      z.object({
        totalUsers: z.number(),
        totalUsersGrowth: z.number().nullable(),
        activeNow: z.number(),
        wau: z.number(),
        wauGrowth: z.number().nullable(),
        mau: z.number(),
        mauGrowth: z.number().nullable(),
      })
    )
  );
export type UserStatsInput = InferContractRouterInputs<
  typeof userStatsContract
>;
export type UserStatsOutput = InferContractRouterOutputs<
  typeof userStatsContract
>["data"];

const updateUserContract = userBaseContract
  .route({
    path: "/users/update",
    description: "Update user",
    tags,
  })
  .input(
    updateUserSchema.extend({
      userId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(selectUserSchema));
export type UpdateUserContractInput = InferContractRouterInputs<
  typeof updateUserContract
>;
export type UpdateUserContractOutput = InferContractRouterOutputs<
  typeof updateUserContract
>["data"];

const updateUserRoleContract = userBaseContract
  .route({
    path: "/users/update/role",
    description: "Update role",
    tags,
  })
  .input(roleUpdateSchema)
  .output(apiOutputZodSchema(z.null()));
export type UpdateUserRoleContractInput = InferContractRouterInputs<
  typeof updateUserRoleContract
>;
export type UpdateUserRoleContractOutput = InferContractRouterOutputs<
  typeof updateUserRoleContract
>["data"];

const userDetailsContract = userBaseContract
  .route({
    path: "/users/details",
    description: "Get user details",
    tags,
  })
  .input(z.object({ userId: z.uuid() }))
  .output(
    apiOutputZodSchema(
      selectUserSchema.extend({
        lastLogin: z.date().nullable(),
      })
    )
  );
export type UserDetailsInput = InferContractRouterInputs<
  typeof userDetailsContract
>;
export type UserDetailsOutput = InferContractRouterOutputs<
  typeof userDetailsContract
>["data"];

const roleAndPermissionTags = [...tags, "Role & Permissions"] as const;

const listRoleContract = userBaseContract
  .route({
    method: "GET",
    path: "/roles/list",
    description: "List of roles",
    tags: roleAndPermissionTags,
  })
  .output(
    apiOutputZodSchema(
      z.array(
        selectRoleSchema
          .pick({
            id: true,
            roleName: true,
            type: true,
            customRoleName: true,
            description: true,
            metadata: true,
          })
          .extend({
            permissions: z.array(
              selectPermissionSchema.pick({
                id: true,
                level: true,
                action: true,
                resource: true,
                description: true,
                name: true,
                metadata: true,
              })
            ),
          })
      )
    )
  );
export type ListRoleInput = InferContractRouterInputs<typeof listRoleContract>;
export type ListRoleOutput = InferContractRouterOutputs<
  typeof listRoleContract
>["data"];

const setRolePermissionsContract = userBaseContract
  .route({
    path: "/roles/set-permissions",
    description: "Set role permissions",
    tags: roleAndPermissionTags,
  })
  .input(
    z.object({
      roleId: z.uuid(),
      permissionIds: z.array(z.uuid()),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type SetRolePermissionsInput = InferContractRouterInputs<
  typeof setRolePermissionsContract
>;
export type SetRolePermissionsOutput = InferContractRouterOutputs<
  typeof setRolePermissionsContract
>["data"];

export const userContract = {
  list: listUserContract,
  stats: userStatsContract,
  update: updateUserContract,
  updateRole: updateUserRoleContract,
  details: userDetailsContract,
  listRole: listRoleContract,
  setRolePermissions: setRolePermissionsContract,
};
