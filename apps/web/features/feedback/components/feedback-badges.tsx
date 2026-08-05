"use client";

import {
  FeedbackIssueStatusEnumType,
  FeedbackIssueTypeEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

const STATUS_VARIANTS: Record<
  FeedbackIssueStatusEnumType,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  OPEN: { variant: "secondary" },
  IN_PROGRESS: { variant: "default" },
  NEEDS_INFO: { variant: "outline" },
  RESOLVED: {
    variant: "default",
    className:
      "bg-green-600/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  },
  CLOSED: { variant: "outline", className: "line-through opacity-70" },
};

const TYPE_VARIANTS: Record<FeedbackIssueTypeEnumType, string> = {
  BUG: "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400",
  FEATURE_REQUEST: "bg-primary/10 text-primary",
  FEEDBACK: "bg-muted text-muted-foreground",
  SUGGESTION: "bg-secondary/60 text-secondary-foreground",
  REPORT:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  OTHER: "bg-muted text-muted-foreground",
};

export function FeedbackStatusBadge({
  status,
}: {
  status: FeedbackIssueStatusEnumType;
}) {
  const config = STATUS_VARIANTS[status] ?? STATUS_VARIANTS.OPEN;

  return (
    <Badge
      variant={config.variant}
      className={cn("shrink-0", config.className)}
    >
      {formatEnumValue(status)}
    </Badge>
  );
}

export function FeedbackTypeBadge({
  type,
}: {
  type: FeedbackIssueTypeEnumType;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("shrink-0 border-transparent", TYPE_VARIANTS[type])}
    >
      {formatEnumValue(type)}
    </Badge>
  );
}
