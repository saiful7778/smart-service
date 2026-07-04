"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@workspace/ui/components/sidebar";

import { sidebarMenuLinks } from "@/constants/sidebarLinks";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";
import { useOrgStore } from "@/stores/zustand/org/OrgStoreContext";
import { filterSidebarMenu } from "@/utils/filterSidebarMenu";

import { NestedMenuItem } from "./NestedMenuItem";

export function SidebarMainMenu() {
  "use no memo";
  const pathname = usePathname();

  const permissions = useAuthStore((state) => state.permissions);
  const authUser = useAuthStore((state) => state.user!);
  const activeOrg = useOrgStore((state) => state.activeOrg!);

  const sidebarLinks = useMemo(
    () =>
      filterSidebarMenu(
        sidebarMenuLinks,
        permissions,
        authUser.id,
        activeOrg.id
      ),
    [permissions, authUser.id, activeOrg.id]
  );

  return (
    <>
      {sidebarLinks.map(({ groupName, items }, idx) => (
        <SidebarGroup key={`sidebar-group-${idx}`}>
          {groupName && <SidebarGroupLabel>{groupName}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((menuLink, idx) => (
                <NestedMenuItem
                  pathname={pathname}
                  key={`nav-${idx}`}
                  menuLink={menuLink}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
