import { LeadEstimateStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";

const statusColorMap: Record<LeadEstimateStatusEnumType, string> = {
  draft:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  viewed:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  declined: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  expired: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function EstimateStatusBadge({
  status,
}: {
  status: LeadEstimateStatusEnumType;
}) {
  return (
    <Badge className={statusColorMap[status]}>{formatEnumValue(status)}</Badge>
  );
}
