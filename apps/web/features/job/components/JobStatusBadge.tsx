import { JobStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import {
  Status,
  StatusIndicator,
  StatusLabel,
  StatusVariant,
} from "@workspace/ui/components/status";

const statusVariantMap: Record<JobStatusEnumType, StatusVariant> = {
  draft: "default",
  scheduled: "info",
  in_progress: "info",
  on_hold: "warning",
  needs_review: "warning",
  completed: "success",
  cancelled: "error",
};

export function JobStatusBadge({ status }: { status: JobStatusEnumType }) {
  return (
    <Status variant={statusVariantMap[status] || "default"}>
      {status === "scheduled" && <StatusIndicator />}
      <StatusLabel>{formatEnumValue(status)}</StatusLabel>
    </Status>
  );
}
