import z from "zod";

import {
  selectOrganizationSchema,
} from "@workspace/drizzle/schemas";
import { apiOutputZodSchema } from "@workspace/lib/utils";

import { baseContract } from "@/server/orpc.contract-base";
import { InferContractRouterType } from "@/types/orpc.types";

import { forgetPasswordSchema, userBannedSchema } from "../auth.schema";
import { ActionTypeEnumSchema, PermissionLevelEnumSchema, ResourceTypeEnumSchema } from "@workspace/drizzle/zod-db-enums";

const tags = ["Auth"] as const;

const authMetadataContract = baseContract
  .route({
    path: "/auth/metadata",
    tags,
  })
  .output(
    apiOutputZodSchema(
      z.object({
        user: z.object({
          id: z.uuid(),
          name: z.string(),
          role: z.string().nullable().optional(),
          email: z.email(),
          emailVerified: z.boolean(),
          image: z.string().nullable().optional(),
          banned: z.boolean().nullable().optional(),
          banReason: z.string().nullable().optional(),
          banExpires: z.date().nullable().optional(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
        session: z.object({
          id: z.string(),
          userId: z.uuid(),
          token: z.string(),
          ipAddress: z.string().nullable().optional(),
          userAgent: z.string().nullable().optional(),
          activeOrganizationId: z.uuid().nullable().optional(),
          activeTeamId: z.uuid().nullable().optional(),
          impersonatedBy: z.uuid().nullable().optional(),
          expiresAt: z.date(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
        roles: z.array(
          z.object({
            roleName: z.string(),
            source: z.enum(["SYSTEM", "ORG"]),
            orgId: z.uuid().optional(),
            orgName: z.string().optional(),
            orgSlug: z.string().optional(),
          })
        ),
        permissions: z.array(z
            .object({
              name: z.string(),
              level: PermissionLevelEnumSchema,
                              action: ActionTypeEnumSchema,
                              resource: ResourceTypeEnumSchema,
              source: z.enum(["SYSTEM", "ORG"]),
              orgId: z.uuid().optional(),
              orgName: z.string().optional(),
              orgSlug: z.string().optional(),
            })
        ),
        isAdminUser: z.boolean(),
        orgs: z.array(
          selectOrganizationSchema.extend({
            memberRole: z.string(),
            joinedAt: z.date(),
          })
        ),
        activeOrg: selectOrganizationSchema.optional(),
        orgRoles: z.array(
          z.object({
            id: z.uuid(),
            roleName: z.string(),
          })
        ),
      })
    )
  );
export type AuthMetadataContractType = InferContractRouterType<
  typeof authMetadataContract
>;

const requestResetPasswordContract = baseContract
  .route({
    path: "/auth/request-reset-password",
    tags,
  })
  .input(forgetPasswordSchema)
  .output(apiOutputZodSchema(z.null()));
export type RequestResetPasswordContractType = InferContractRouterType<
  typeof requestResetPasswordContract
>;

const userBanContract = baseContract
  .route({
    path: "/auth/ban",
    description: "Ban or unban user",
    tags,
  })
  .input(userBannedSchema)
  .output(apiOutputZodSchema(z.null()));
export type UserBanContractType = InferContractRouterType<typeof userBanContract>;

export const authContract = {
  metadata: authMetadataContract,
  requestResetPassword: requestResetPasswordContract,
  ban: userBanContract,
};
