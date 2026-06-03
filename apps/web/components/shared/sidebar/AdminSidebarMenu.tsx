"use client";

import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@workspace/ui/components/sidebar";

import { adminSidebarMenuLinks } from "@/constants/sidebarLinks";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";
import { filterSidebarMenu } from "@/utils/filterSidebarMenu";

import { NestedMenuItem } from "./NestedMenuItem";

export function AdminSidebarMenu() {
  const pathname = usePathname();
  const roles = useAuthStore((state) => state.roles);

  const sidebarLinks = filterSidebarMenu(adminSidebarMenuLinks, roles);

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
