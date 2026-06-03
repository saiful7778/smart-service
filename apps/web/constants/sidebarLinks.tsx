import { House, Settings, User } from "lucide-react";

import type { SidebarGroupMenuLink, SidebarMenuLink } from "@/types";

export const adminSidebarMenuLinks: Array<SidebarGroupMenuLink> = [
  {
    groupName: "Dashboard",
    items: [
      {
        title: "Dashboard",
        icon: House,
        path: "/dashboard/admin",
        pathRegex: /^\/dashboard\/admin$/,
      },
    ],
  },
];

export const sidebarMenuLinks: Array<SidebarGroupMenuLink> = [
  {
    groupName: "Dashboard",
    items: [
      {
        title: "Dashboard",
        icon: House,
        path: "/dashboard",
        pathRegex: /^\/dashboard$/,
      },
    ],
  },
];

export const footerMenuLinks: Array<SidebarMenuLink> = [
  {
    title: "My Profile",
    icon: User,
    path: "/dashboard/profile",
    pathRegex: /^\/dashboard\/profile$/,
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
    pathRegex: /^\/dashboard\/settings$/,
  },
];

export const settingsMenuLinks: Array<{ title: string; path: string }> = [
  {
    title: "Profile",
    path: "/dashboard/settings/profile",
  },
  {
    title: "Notification",
    path: "/dashboard/settings/notification",
  },
  {
    title: "Update Password",
    path: "/dashboard/settings/update-password",
  },
  {
    title: "Sessions",
    path: "/dashboard/settings/sessions",
  },
  {
    title: "Connected Apps",
    path: "/dashboard/settings/connected-apps",
  },
];
