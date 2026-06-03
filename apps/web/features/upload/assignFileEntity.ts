import { eq } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import { FileTable, InsertFile } from "@workspace/drizzle/schemas";

export async function assignFileEntityByFileKey(
  fileKey: string,
  inputData: Pick<InsertFile, "entityType" | "entityId">,
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
  inputData: Pick<InsertFile, "entityType" | "entityId">,
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
