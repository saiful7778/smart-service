import Link from "next/link";
import React from "react";

import { ArrowLeft } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface DashboardShellProps extends React.ComponentProps<"div"> {
  title: string;
  shortDescription?: string;
  backUrl?: string;
}

export function DashboardShell({
  title,
  shortDescription,
  children,
  backUrl,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div
      className={cn("px-2 pt-2 pb-2 sm:px-4 sm:pt-3 sm:pb-4 w-full", className)}
      {...props}
    >
      <div className="space-y-4 md:space-y-6 max-w-7xl w-full mx-auto">
        <div>
          {backUrl && (
            <Button
              className="mb-1"
              variant="ghost"
              nativeButton={false}
              render={<Link href={{ pathname: backUrl }} />}
            >
              <ArrowLeft />
              <span>Go Back</span>
            </Button>
          )}
          <h1 className="text-lg md:text-3xl font-bold">{title}</h1>
          {shortDescription && (
            <p className="text-muted-foreground text-sm">{shortDescription}</p>
          )}
        </div>
        <div className="space-y-4 md:space-y-6">{children}</div>
      </div>
    </div>
  );
}
