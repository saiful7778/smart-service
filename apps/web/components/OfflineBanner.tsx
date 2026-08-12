"use client";

import { useEffect, useState } from "react";

import { onlineManager, useIsMutating } from "@tanstack/react-query";

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
      style={{
        padding: "0.5rem 1rem",
        textAlign: "center",
        fontSize: "0.875rem",
        background: isOnline ? "#1f4d2c" : "#4d1f1f",
        color: "white",
      }}
    >
      {!isOnline && "You're offline — showing cached data. "}
      {pendingMutations > 0 &&
        `${pendingMutations} change${pendingMutations > 1 ? "s" : ""} waiting to sync…`}
    </div>
  );
}
