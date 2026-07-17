import {
  EntityTypeEnumType,
  privateEntityTypeEnumSchema,
  publicEntityTypeEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

export function determineStorageType(
  entityType: EntityTypeEnumType
): "public" | "private" {
  if (privateEntityTypeEnumSchema.safeParse(entityType)) {
    return "private";
  }
  if (publicEntityTypeEnumSchema.safeParse(entityType)) {
    return "public";
  }

  return "private";
}
