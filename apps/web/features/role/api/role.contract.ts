import z from "zod";

import {
  selectOrgRoleSchema,
  selectPermissionSchema,
  selectRoleSchema,
} from "@workspace/drizzle/schemas";
import { apiOutputZodSchema } from "@workspace/lib/utils";

import { baseContract } from "@/server/orpc.contract-base";
import { InferContractRouterType } from "@/types/orpc.types";

import { createOrUpdateOrgRoleSchema } from "../role.schema";
import { ActionTypeEnumSchema, PermissionLevelEnumSchema, ResourceTypeEnumSchema } from "@workspace/drizzle/zod-db-enums";

const tags = ["Role & Permissions"] as const;

const listRoleContract = baseContract
  .route({
    method: "GET",
    path: "/roles/list",
    description: "List of roles",
    tags,
  })
  .output(
    apiOutputZodSchema(
      z.array(
        selectRoleSchema
          .pick({
            id: true,
            roleName: true,
            type: true,
            description: true,
            createdAt: true,
          })
          .extend({
            totalUsers: z.number(),
            permissions: z.array(
              selectPermissionSchema.pick({
                id: true,
                description: true,
                name: true,
              }).extend({
                level: PermissionLevelEnumSchema,
                action: ActionTypeEnumSchema,
                resource: ResourceTypeEnumSchema,
              })
            ),
          })
      )
    )
  );
export type ListRoleContractType = InferContractRouterType<
  typeof listRoleContract
>;

const listOrgPermissionContract = baseContract
  .route({
    method: "GET",
    path: "/roles/org/permissions/list",
    description: "List of organization permissions",
    tags,
  })
  .output(
    apiOutputZodSchema(
      z.array(
        selectPermissionSchema.pick({
          id: true,
          level: true,
          action: true,
          resource: true,
          description: true,
          name: true,
        })
      )
    )
  );
export type ListOrgPermissionContractType = InferContractRouterType<
  typeof listOrgPermissionContract
>;

const listOrgRoleContract = baseContract
  .route({
    method: "GET",
    path: "/roles/org/list",
    description: "List of organization roles",
    tags,
  })
  .output(
    apiOutputZodSchema(
      z.array(
        z.object({
          id: z.uuid(),
          roleName: z.string(),
          description: z.string().nullable(),
          type: z.enum(["system", "dynamic"]),
          createdAt: z.date(),
          permissions: z.array(
            selectPermissionSchema.pick({
              id: true,
              description: true,
              name: true,
            }).extend({
              level: PermissionLevelEnumSchema,
                action: ActionTypeEnumSchema,
                resource: ResourceTypeEnumSchema,
            })
          ),
        })
      )
    )
  );
export type ListOrgRoleContractType = InferContractRouterType<
  typeof listOrgRoleContract
>;

const createOrgRoleContract = baseContract
  .route({
    method: "POST",
    path: "/roles/org/create",
    description: "Create an organization role",
    tags,
  })
  .input(createOrUpdateOrgRoleSchema)
  .output(apiOutputZodSchema(selectOrgRoleSchema));
export type CreateOrgRoleContractType = InferContractRouterType<
  typeof createOrgRoleContract
>;

const updateOrgRoleContract = baseContract
  .route({
    method: "POST",
    path: "/roles/org/update",
    description: "Update an organization role",
    tags,
  })
  .input(
    createOrUpdateOrgRoleSchema.extend({
      roleId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(selectOrgRoleSchema));
export type UpdateOrgRoleContractType = InferContractRouterType<
  typeof updateOrgRoleContract
>;

const deleteOrgRoleContract = baseContract
  .route({
    method: "POST",
    path: "/roles/org/delete",
    description: "Delete an organization role",
    tags,
  })
  .input(
    z.object({
      roleId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type DeleteOrgRoleContractType = InferContractRouterType<
  typeof deleteOrgRoleContract
>;

export const roleContract = {
  listRole: listRoleContract,
  listOrgPermission: listOrgPermissionContract,
  listOrgRole: listOrgRoleContract,
  createOrgRole: createOrgRoleContract,
  updateOrgRole: updateOrgRoleContract,
  deleteOrgRole: deleteOrgRoleContract,
};
