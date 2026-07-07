"use client";

import { useState } from "react";

import { Badge } from "@workspace/ui/components/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

interface TruncatedListItem {
  id: string | number;
  name: string;
}

interface TruncatedListProps<T extends TruncatedListItem> {
  items: T[];
  limit?: number;
  emptyText?: string;
  renderItem?: (item: T) => React.ReactNode;
  renderMoreButton?: (hiddenCount: number) => React.ReactNode;
  popoverTitle?: string;
  className?: string;
}

function TruncatedList<T extends TruncatedListItem>({
  items,
  limit = 2,
  emptyText = "Not specified",
  renderItem,
  renderMoreButton,
  popoverTitle,
  className = "",
}: TruncatedListProps<T>) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return (
      <span className="text-muted-foreground text-xs italic">{emptyText}</span>
    );
  }

  const visibleItems = items.slice(0, limit);
  const hiddenItems = items.slice(limit);
  const hasMore = items.length > limit;

  const defaultRenderItem = (item: T) => (
    <Badge key={item.id} variant="secondary">
      {item.name}
    </Badge>
  );

  const defaultRenderMoreButton = (hiddenCount: number) => (
    <Badge
      variant="secondary"
      className="cursor-pointer hover:bg-secondary/80 transition-colors"
    >
      {`${hiddenCount}+`}
    </Badge>
  );

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleItems.map((item) =>
        renderItem ? renderItem(item) : defaultRenderItem(item)
      )}

      {hasMore && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            {renderMoreButton
              ? renderMoreButton(hiddenItems.length)
              : defaultRenderMoreButton(hiddenItems.length)}
          </PopoverTrigger>
          <PopoverContent className="w-auto max-w-xs" align="start">
            {popoverTitle && (
              <p className="text-sm font-medium text-muted-foreground">
                {popoverTitle}
              </p>
            )}
            <div className="flex flex-wrap gap-1">
              {hiddenItems.map((item) =>
                renderItem ? renderItem(item) : defaultRenderItem(item)
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export default TruncatedList;
