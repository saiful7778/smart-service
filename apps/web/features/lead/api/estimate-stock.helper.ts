import { sql, eq, inArray, isNull, and } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import { DatabaseType } from "@workspace/drizzle/client";
import { MaterialTable } from "@workspace/drizzle/schemas";

import { API_MESSAGES } from "@/constants/apiMessage";

export async function reduceStock(
  database: DatabaseType,
  materials: Array<{ materialId: string; quantity: string | number }>
) {
  const materialIds = materials.map((m) => m.materialId);
  const existingMaterials = await database
    .select({
      id: MaterialTable.id,
      stockQuantity: MaterialTable.stockQuantity,
    })
    .from(MaterialTable)
    .where(
      and(
        inArray(MaterialTable.id, materialIds),
        isNull(MaterialTable.deletedAt)
      )
    );

  for (const mat of materials) {
    const existing = existingMaterials.find(
      (e: { id: string }) => e.id === mat.materialId
    );
    if (!existing) {
      throw new ORPCError("BAD_REQUEST", {
        message: `${API_MESSAGES.ESTIMATE.INSUFFICIENT_STOCK}Material not found`,
      });
    }
    const currentStock = Number(existing.stockQuantity);
    const qty = Number(mat.quantity);
    if (currentStock < qty) {
      throw new ORPCError("BAD_REQUEST", {
        message: `${API_MESSAGES.ESTIMATE.INSUFFICIENT_STOCK}insufficient stock`,
      });
    }
    await database
      .update(MaterialTable)
      .set({
        stockQuantity: sql`${MaterialTable.stockQuantity} - ${qty}`,
      })
      .where(eq(MaterialTable.id, mat.materialId));
  }
}

export async function increaseStock(
  database: DatabaseType,
  materials: Array<{ materialId: string; quantity: string | number }>
) {
  for (const mat of materials) {
    if (!mat.materialId) continue;
    const qty = Number(mat.quantity);
    await database
      .update(MaterialTable)
      .set({
        stockQuantity: sql`${MaterialTable.stockQuantity} + ${qty}`,
      })
      .where(eq(MaterialTable.id, mat.materialId));
  }
}
