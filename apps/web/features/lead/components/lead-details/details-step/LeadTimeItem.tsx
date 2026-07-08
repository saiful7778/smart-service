"use client";

import { formatDate } from "date-fns";
import { Clock } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

export function LeadTimeItem({
  title,
  timeValue,
  isHighlighted = false,
}: {
  title: string;
  timeValue: Date | null | undefined;
  isHighlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded-md border",
        isHighlighted && "bg-primary/10"
      )}
    >
      {timeValue ? (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              {title}
            </span>
            <span className="text-sm font-semibold tracking-tight">
              {formatDate(timeValue, "dd MMM, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-border/50 text-[11px] font-medium text-muted-foreground shadow-sm">
            <Clock className="size-3" />
            {formatDate(timeValue, "hh:mm aa")}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            {title}
          </span>
          <span className="text-sm font-semibold tracking-tight">N/A</span>
        </div>
      )}
    </div>
  );
}
