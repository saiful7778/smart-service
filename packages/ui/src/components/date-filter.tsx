"use client";

import { useCallback, useMemo, useState } from "react";

import { formatDate } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button, type ButtonProps } from "@workspace/ui/components/button";
import {
  Calendar,
  type CalendarProps,
} from "@workspace/ui/components/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";

function isDateRange(value: unknown): value is DateRange {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "from" in value &&
    "to" in value
  );
}

function safeFormat(date: Date | undefined): string {
  return date ? formatDate(date, "MMM dd, yy") : "";
}

export interface DateFilterProps {
  value?: Date | DateRange | undefined;
  onValueChange?: (value: Date | DateRange | undefined) => void;
  onCancel?: () => void;
  onApply?: (value: Date | DateRange | undefined) => void;
  placeholder?: string;
  isInRange?: boolean;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  calendarProps?: Omit<CalendarProps, "selected" | "onSelect" | "mode">;
}

export function DateFilter({
  value,
  onValueChange,
  onCancel,
  onApply,
  placeholder = "Select date",
  isInRange,
  variant = "outline",
  size = "default",
  className,
  calendarProps,
}: DateFilterProps) {
  "use no memo";
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSelect = useCallback(
    (val: Date | DateRange | undefined) => {
      onValueChange?.(val);
      if (!isInRange && val instanceof Date) {
        onApply?.(val);
        setOpen(false);
      }
    },
    [onValueChange, isInRange, onApply]
  );

  const handleApply = useCallback(() => {
    onApply?.(value);
    setOpen(false);
  }, [onApply, value]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    setOpen(false);
  }, [onCancel]);

  const trigger = (
    <DateFilterTrigger
      isInRange={isInRange}
      value={value}
      placeholder={placeholder}
      variant={variant}
      size={size}
      className={className}
    />
  );

  const content = (
    <DateFilterContent
      isInRange={isInRange}
      value={value}
      onSelect={handleSelect}
      onCancel={handleCancel}
      onApply={handleApply}
      calendarProps={calendarProps}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{placeholder}</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <div className="border-t flex flex-col gap-2">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent className="w-auto p-0" align="start">
        {content}
      </PopoverContent>
    </Popover>
  );
}

interface DateFilterTriggerProps extends Omit<ButtonProps, "value"> {
  isInRange?: boolean;
  value: Date | DateRange | undefined;
  placeholder?: string;
}

function DateFilterTrigger({
  isInRange,
  value,
  placeholder,
  className,
  variant = "outline",
  size = "default",
  ...props
}: DateFilterTriggerProps) {
  const label = useMemo(() => {
    if (isInRange && isDateRange(value)) {
      const has = value.from || value.to;
      const text = has
        ? value.from && value.to
          ? `${safeFormat(value.from)} - ${safeFormat(value.to)}`
          : safeFormat(value.from ?? value.to)
        : null;

      return (
        <>
          <span>{placeholder}</span>
          {text && <Separator orientation="vertical" className="mx-2" />}
          {text && <span>{text}</span>}
        </>
      );
    }

    if (!isInRange && value instanceof Date) {
      return (
        <>
          <span>{placeholder}</span>
          <Separator orientation="vertical" className="mx-2" />
          <span>{safeFormat(value)}</span>
        </>
      );
    }

    return <span>{placeholder}</span>;
  }, [isInRange, placeholder, value]);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("border-dashed font-normal", className)}
      {...props}
    >
      <CalendarIcon className="size-4" />
      {label}
    </Button>
  );
}

interface DateFilterContentProps {
  isInRange?: boolean;
  value: Date | DateRange | undefined;
  calendarProps?: Omit<CalendarProps, "selected" | "onSelect" | "mode">;
  onSelect: (value: Date | DateRange | undefined) => void;
  onCancel: () => void;
  onApply: () => void;
}

function DateFilterContent({
  isInRange,
  value,
  onSelect,
  onCancel,
  onApply,
  calendarProps,
}: DateFilterContentProps) {
  return (
    <div className="flex flex-col">
      {isInRange ? (
        <>
          <Calendar
            autoFocus
            captionLayout="dropdown"
            mode="range"
            selected={isDateRange(value) ? value : undefined}
            onSelect={onSelect}
            {...calendarProps}
          />
          <div className="flex items-center gap-2 px-2 pb-2">
            <Button className="flex-1" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onApply}>
              Apply
            </Button>
          </div>
        </>
      ) : (
        <Calendar
          captionLayout="dropdown"
          mode="single"
          selected={value instanceof Date ? value : undefined}
          onSelect={onSelect}
          {...calendarProps}
        />
      )}
    </div>
  );
}
