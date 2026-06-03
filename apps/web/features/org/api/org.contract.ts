import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import {
  selectOrganizationSchema,
  selectUserSchema,
} from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  OrgRoleEnumSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { baseContract } from "@/server/orpc.contract-base";

import { createOrgSchema, inviteOrgMemberSchema } from "../org.schema";

const tags = ["Organization"] as const;

const createOrgContract = baseContract
  .route({
    path: "/orgs/create",
    description: "Create new organization",
    tags,
  })
  .input(createOrgSchema)
  .output(
    apiOutputZodSchema(
      selectOrganizationSchema.pick({
        id: true,
        name: true,
        slug: true,
      })
    )
  );
export type CreateOrgInput = InferContractRouterInputs<
  typeof createOrgContract
>;
export type CreateOrgOutput = InferContractRouterOutputs<
  typeof createOrgContract
>["data"];

const listMemberContract = baseContract
  .route({
    path: "/orgs/members/list",
    description: "List organization members",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectUserSchema>({
      searchFields: ["name", "email"],
      orderFields: ["createdAt"],
      filter: z.object({
        roleName: OrgRoleEnumSchema.optional(),
      }),
    })
  )
  .output(apiOutputZodSchema(paginateOutputZodSchema(userProfileSchema)));
export type ListMemberInput = InferContractRouterInputs<
  typeof listMemberContract
>;
export type ListMemberOutput = InferContractRouterOutputs<
  typeof listMemberContract
>["data"];

const inviteMemberContract = baseContract
  .route({
    path: "/orgs/invitation/invite",
    description: "Invite member to organization",
    tags,
  })
  .input(inviteOrgMemberSchema)
  .output(apiOutputZodSchema(z.null()));
export type InviteMemberInput = InferContractRouterInputs<
  typeof inviteMemberContract
>;
export type InviteMemberOutput = InferContractRouterOutputs<
  typeof inviteMemberContract
>["data"];

const acceptOrRejectInvitationContract = baseContract
  .route({
    path: "/orgs/invitation/accept-or-reject",
    description: "Accept or reject invitation to organization",
    tags,
  })
  .input(
    z.object({
      invitationId: z.string(),
      action: z.enum(["accept", "reject"]),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type AcceptInvitationInput = InferContractRouterInputs<
  typeof acceptOrRejectInvitationContract
>;
export type AcceptInvitationOutput = InferContractRouterOutputs<
  typeof acceptOrRejectInvitationContract
>["data"];

const listMemberForSearchContract = baseContract
  .route({
    path: "/orgs/members/search",
    description: "List organization members for search",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectUserSchema>({
      searchFields: ["name", "email"],
      orderFields: [],
    })
  )
  .output(apiOutputZodSchema(z.array(userProfileSchema)));
export type ListMemberForSearchInput = InferContractRouterInputs<
  typeof listMemberForSearchContract
>;
export type ListMemberForSearchOutput = InferContractRouterOutputs<
  typeof listMemberForSearchContract
>["data"];

export const orgContract = {
  create: createOrgContract,
  listMember: listMemberContract,
  inviteMember: inviteMemberContract,
  acceptOrRejectInvitation: acceptOrRejectInvitationContract,
  listMemberForSearch: listMemberForSearchContract,
};
