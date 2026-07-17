import { eq } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import { FileTable } from "@workspace/drizzle/schemas";
import { EntityTypeEnumType } from "@workspace/drizzle/zod-db-enums";

export async function assignFileEntityByFileKey(
  fileKey: string,
  inputData: { entityType: EntityTypeEnumType; entityId: string },
  database: DatabaseType
) {
  await database
    .update(FileTable)
    .set({
      entityType: inputData.entityType,
      entityId: inputData.entityId,
    })
    .where(eq(FileTable.key, fileKey));
}

export async function assignFileEntityById(
  id: string,
  inputData: { entityType: EntityTypeEnumType; entityId: string },
  database: DatabaseType
) {
  await database
    .update(FileTable)
    .set({
      entityType: inputData.entityType,
      entityId: inputData.entityId,
    })
    .where(eq(FileTable.id, id));
}
