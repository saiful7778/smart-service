"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

import { ChevronsUpDown, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";

import { authClient } from "@/lib/better-auth/auth-client";

import orgPlaceholderImg from "@/public/org_placeholder.png";
import { StateOrganizationType } from "@/stores/zustand/org/orgStore";
import { useOrgStore } from "@/stores/zustand/org/OrgStoreContext";
import { resolveImagePath } from "@/utils/resolveImagePath";

export function OrgSelector() {
  const { isMobile } = useSidebar();
  const orgs = useOrgStore((state) => state.organizations);
  const activeOrg = useOrgStore((state) => state.activeOrg);

  const { isLoading, onSetActiveOrg } = useActiveOrg();

  if (orgs.length === 0) return null;

  return (
    <DropdownMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger
          disabled={isLoading}
          render={
            <SidebarMenuButton className="rounded-md border" size="lg">
              {activeOrg ? (
                <>
                  <span className="inline-flex aspect-square size-8 items-center justify-center">
                    <span className="overflow-hidden shrink-0 size-full rounded-lg border">
                      <Image
                        src={
                          activeOrg.logo
                            ? resolveImagePath(activeOrg.logo)
                            : orgPlaceholderImg.src
                        }
                        className="size-full object-cover object-center"
                        alt={`${activeOrg.name} logo`}
                        width={36}
                        height={36}
                      />
                    </span>
                  </span>
                  <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-medium text-sm">
                      {activeOrg.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {activeOrg.slug}
                    </span>
                  </span>
                  <ChevronsUpDown className="ml-auto" />
                </>
              ) : (
                "Organization is unselected"
              )}
            </SidebarMenuButton>
          }
        >
          Open organization selector
        </DropdownMenuTrigger>
      </SidebarMenuItem>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          {orgs.map((org) => (
            <DropdownMenuItem
              disabled={isLoading}
              key={org.name}
              onClick={() => onSetActiveOrg(org)}
            >
              <div className="inline-flex aspect-square size-7 overflow-hidden items-center justify-center rounded-md border">
                <Image
                  src={
                    org.logo
                      ? resolveImagePath(org.logo)
                      : orgPlaceholderImg.src
                  }
                  className="size-full shrink-0 object-cover object-center"
                  alt={`${org.name} logo`}
                  width={36}
                  height={36}
                />
              </div>
              <span>{org.name}</span>
              {org.id === activeOrg?.id && (
                <Badge variant="outline">Active</Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/organization/create" />}>
            <Plus /> <span>Create Organization</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function useActiveOrg() {
  const activeOrg = useOrgStore((state) => state.activeOrg);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSetActiveOrg = useCallback(
    async (org: StateOrganizationType) => {
      const toastId = "set_active_org_toast_message";

      if (org.id === activeOrg?.id) {
        toast.success("Organization is already active!");
        return;
      }

      return authClient.organization.setActive({
        organizationId: org.id,
        organizationSlug: org.slug,
        fetchOptions: {
          onRequest: () => {
            setIsLoading(true);
            toast.loading("Loading...", { id: toastId });
          },
          onSuccess: () => {
            setIsLoading(false);
            toast.success("Organization is activated!", { id: toastId });

            setTimeout(() => window.location.reload(), 500);
          },
          onError: ({ error }) => {
            setIsLoading(false);
            toast.error(error.message ?? "Failed to load organization.", {
              id: toastId,
            });
          },
        },
      });
    },
    [activeOrg]
  );

  return { onSetActiveOrg, isLoading };
}
