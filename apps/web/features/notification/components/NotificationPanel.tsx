"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { Bell, CheckCheck } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";

import { useNotificationStore } from "@/stores/zustand/notification/NotificationStoreContext";

import { useNotificationMarkAsRead } from "../api/notification.api.hook";
import { NotificationItem } from "./NotificationItem";

export function NotificationPanel() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const notifications = useNotificationStore((state) => state.notifications);

  const { mutate: markAsRead, isPending } = useNotificationMarkAsRead();

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const handleMarkAllAsRead = useCallback(() => {
    markAsRead({
      ids: notifications.filter((n) => !n.isRead).map((n) => n.id),
    });
  }, [markAsRead, notifications]);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger
        render={
          <Button
            size="icon-lg"
            variant="secondary"
            className="relative cursor-pointer"
          >
            <Bell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 size-3 rounded-full bg-accent z-10" />
            )}
          </Button>
        }
      />
      <PopoverContent align="end" side="bottom" className="w-100 gap-0 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Bell className="size-4" />
            <span className="text-sm font-semibold tracking-tight select-none">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full size-4 inline-flex items-center justify-center bg-secondary text-secondary-foreground px-1.5 text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <Button
            variant="secondary"
            size="xs"
            onClick={handleMarkAllAsRead}
            disabled={isPending || unreadCount === 0}
            aria-disabled={isPending || unreadCount === 0}
          >
            <CheckCheck />
            <span>Mark all read</span>
          </Button>
        </div>

        <Separator />

        {/* Notification List */}
        <ScrollArea className="h-100">
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-center p-1 border-t">
          <Button
            className="w-full cursor-pointer"
            size="xs"
            variant="ghost"
            nativeButton={false}
            render={
              <Link href={{ pathname: "/dashboard/notifications" }}>
                Read All Notifications
              </Link>
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
