import z from "zod";

import {
  selectInvitationSchema,
  selectOrganizationSchema,
  selectOrgMemberSchema,
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
import { InferContractRouterType } from "@/types/orpc.types";

import {
  createOrgSchema,
  invitationStatusEnum,
  inviteOrgMemberSchema,
  updateInvitationSchema,
  updateMemberSchema,
} from "../org.schema";

const tags = ["Organization"] as const;

const createOrgContract = baseContract
  .route({
    path: "/orgs/create",
    description: "Create new organization",
    tags,
  })
  .input(createOrgSchema.extend({ imageId: z.uuid().optional() }))
  .output(
    apiOutputZodSchema(
      selectOrganizationSchema.pick({
        id: true,
        name: true,
        slug: true,
      })
    )
  );
export type CreateOrgContractType = InferContractRouterType<
  typeof createOrgContract
>;

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
    })
  )
  .output(apiOutputZodSchema(paginateOutputZodSchema(userProfileSchema)));
export type ListMemberContractType = InferContractRouterType<
  typeof listMemberContract
>;

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
export type ListMemberForSearchContractType = InferContractRouterType<
  typeof listMemberForSearchContract
>;

const inviteMemberContract = baseContract
  .route({
    path: "/orgs/invitations/invite",
    description: "Invite member to organization",
    tags,
  })
  .input(inviteOrgMemberSchema)
  .output(apiOutputZodSchema(z.null()));
export type InviteMemberContractType = InferContractRouterType<
  typeof inviteMemberContract
>;

const acceptOrRejectInvitationContract = baseContract
  .route({
    path: "/orgs/invitations/accept-or-reject",
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
export type AcceptInvitationContractType = InferContractRouterType<
  typeof acceptOrRejectInvitationContract
>;

const listInvitationContract = baseContract
  .route({
    path: "/orgs/invitations/list",
    description: "List organization invitations",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectInvitationSchema>({
      searchFields: ["email"],
      orderFields: ["createdAt"],
      filter: z.object({
        status: invitationStatusEnum.nullable().optional(),
        role: OrgRoleEnumSchema.nullable().optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectInvitationSchema
          .omit({
            organizationId: true,
            inviterId: true,
          })
          .extend({
            inviter: userProfileSchema,
          })
      )
    )
  );
export type ListInvitationContractType = InferContractRouterType<
  typeof listInvitationContract
>;

const updateMemberContract = baseContract
  .route({
    path: "/orgs/members/update",
    description: "Update organization member",
    tags,
  })
  .input(updateMemberSchema)
  .output(apiOutputZodSchema(selectOrgMemberSchema));
export type UpdateMemberContractType = InferContractRouterType<
  typeof updateMemberContract
>;

const updateInvitationContract = baseContract
  .route({
    path: "/orgs/invitations/update",
    description: "Update organization invitation",
    tags,
  })
  .input(updateInvitationSchema)
  .output(apiOutputZodSchema(selectInvitationSchema));
export type UpdateInvitationContractType = InferContractRouterType<
  typeof updateInvitationContract
>;

const deleteInvitationContract = baseContract
  .route({
    path: "/orgs/invitations/delete",
    description: "Delete organization invitation",
    tags,
  })
  .input(
    z.object({
      invitationId: z.string(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type DeleteInvitationContractType = InferContractRouterType<
  typeof deleteInvitationContract
>;

export const orgContract = {
  create: createOrgContract,
  listMember: listMemberContract,
  inviteMember: inviteMemberContract,
  acceptOrRejectInvitation: acceptOrRejectInvitationContract,
  listMemberForSearch: listMemberForSearchContract,
  updateMember: updateMemberContract,
  listInvitation: listInvitationContract,
  updateInvitation: updateInvitationContract,
  deleteInvitation: deleteInvitationContract,
};
