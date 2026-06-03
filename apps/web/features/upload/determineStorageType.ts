import z from "zod";

export const PRIVATE_ENTITY_TYPES = [
  "lead_attachment",
  "job_attachment",
  "material_file",
  "lead_payment",
  "job_payment",
] as const;
export type PrivateEntityType = (typeof PRIVATE_ENTITY_TYPES)[number];

export const PUBLIC_ENTITY_TYPES = ["profile_image", "org_logo"] as const;
export type PublicEntityType = (typeof PUBLIC_ENTITY_TYPES)[number];

export const entityTypeEnumSchema = z
  .enum(PRIVATE_ENTITY_TYPES)
  .or(z.enum(PUBLIC_ENTITY_TYPES));
export type EntityTypeEnumType = z.infer<typeof entityTypeEnumSchema>;

export function determineStorageType(
  entityType: PrivateEntityType | PublicEntityType
): "public" | "private" {
  if (PRIVATE_ENTITY_TYPES.includes(entityType as PrivateEntityType)) {
    return "private";
  }
  if (PUBLIC_ENTITY_TYPES.includes(entityType as PublicEntityType)) {
    return "public";
  }

  return "private";
}
