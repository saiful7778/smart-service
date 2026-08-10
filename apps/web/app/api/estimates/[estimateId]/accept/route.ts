import { NextRequest } from "next/server";

import { and, eq, isNull } from "drizzle-orm";

import { LeadEstimateTable } from "@workspace/drizzle/schemas";
import { LeadEstimateStatusEnumType } from "@workspace/drizzle/zod-db-enums";

import { ApiResponseJson } from "@/lib/ApiResponseJson";
import { db } from "@/lib/db";

import { formatApiError } from "@/utils/formatApiError";

const ACCEPTABLE_STATUSES = ["sent", "viewed"] as LeadEstimateStatusEnumType[];

export async function POST(
  _request: NextRequest,
  props: { params: Promise<{ estimateId: string }> }
) {
  try {
    const { estimateId } = await props.params;

    const [estimate] = await db
      .select({
        id: LeadEstimateTable.id,
        status: LeadEstimateTable.status,
      })
      .from(LeadEstimateTable)
      .where(
        and(
          eq(LeadEstimateTable.id, estimateId),
          isNull(LeadEstimateTable.deletedAt)
        )
      )
      .limit(1);

    if (!estimate) {
      return ApiResponseJson(false, "Estimate not found.", null, 404);
    }

    if (!ACCEPTABLE_STATUSES.includes(estimate.status)) {
      return ApiResponseJson(
        false,
        `Estimate cannot be accepted. Current status: ${estimate.status}.`,
        null,
        400
      );
    }

    await db
      .update(LeadEstimateTable)
      .set({
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(eq(LeadEstimateTable.id, estimate.id));

    return ApiResponseJson(true, "Estimate accepted successfully.");
  } catch (err) {
    const { message, statusCode } = formatApiError(err);

    return ApiResponseJson(false, message, null, statusCode);
  }
}
