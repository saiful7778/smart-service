"use client";

import { useEffect, useState } from "react";

import { onlineManager, useIsMutating } from "@tanstack/react-query";

import { cn } from "@workspace/ui/lib/utils";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const pendingMutations = useIsMutating();

  useEffect(() => {
    queueMicrotask(() => {
      setIsOnline(onlineManager.isOnline());
    });

    return onlineManager.subscribe(() => {
      setIsOnline(onlineManager.isOnline());
    });
  }, []);

  if (isOnline && pendingMutations === 0) return null;

  return (
    <div
      role="status"
      className={cn(
        "px-4 py-2 text-center text-sm text-white",
        isOnline ? "bg-green-900" : "bg-red-900"
      )}
    >
      {!isOnline && "You're offline — showing cached data. "}
      {pendingMutations > 0 &&
        `${pendingMutations} ${pendingMutations > 1 ? "changes" : "change"} waiting to sync…`}
    </div>
  );
}
