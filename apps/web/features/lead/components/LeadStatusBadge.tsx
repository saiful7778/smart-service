import { LeadStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import {
  Status,
  StatusIndicator,
  StatusLabel,
  StatusVariant,
} from "@workspace/ui/components/status";

const statusVariantMap: Record<LeadStatusEnumType, StatusVariant> = {
  new: "default",
  contacted: "info",
  qualified: "success",
  nurture: "warning",
  converted: "success",
  lost: "error",
  cancelled: "error",
  disqualified: "error",
};

export function LeadStatusBadge({ status }: { status: LeadStatusEnumType }) {
  return (
    <Status variant={statusVariantMap[status] || "default"}>
      {status === "new" && <StatusIndicator />}
      <StatusLabel>{formatEnumValue(status)}</StatusLabel>
    </Status>
  );
}
