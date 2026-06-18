import { InvitationStatus } from "better-auth/plugins";
import z from "zod";

import { OrgRoleEnumSchema } from "@workspace/lib/utils";

export const createOrgSchema = z.object({
  userId: z.uuid(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(64, "Name must be under 64 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(48, "Slug must be under 48 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  email: z.email(),
  phone: z.string().optional(),
  logoUrl: z.url().optional(),
  logoKey: z.string().optional(),
  line1: z.string().min(1, "Address 1 is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip Code is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  placeId: z.string().optional(),
});
export type CreateOrgType = z.infer<typeof createOrgSchema>;

export const inviteOrgMemberSchema = z.object({
  email: z.email(),
  role: OrgRoleEnumSchema,
  organizationId: z.uuid(),
});
export type InviteOrgMemberType = z.infer<typeof inviteOrgMemberSchema>;

export const invitationStatusEnum = z.enum([
  "pending",
  "accepted",
  "rejected",
  "canceled",
] as InvitationStatus[]);
export type InvitationStatusEnumType = z.infer<typeof invitationStatusEnum>;
