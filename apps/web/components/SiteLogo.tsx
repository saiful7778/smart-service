import Link from "next/link";

import { GalleryVerticalEnd } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

import { env } from "@/lib/env";

export default function SiteLogo() {
  return (
    <Link
      href={{
        pathname: "/",
      }}
      className={cn("flex items-center gap-2 self-center font-semibold")}
    >
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <GalleryVerticalEnd className="size-4" />
      </div>
      <span>{env.NEXT_PUBLIC_SITE_NAME}</span>
    </Link>
  );
}
