import {
  House,
  Mails,
  Settings,
  ShieldUser,
  User,
  UsersRound,
} from "lucide-react";

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
      {
        title: "Roles & Permissions",
        icon: ShieldUser,
        permissions: ["system.role.manage", "system.role.list"],
        path: "/dashboard/admin/roles",
        pathRegex: /^\/dashboard\/admin\/roles$/,
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
  {
    groupName: "Admin",
    items: [
      {
        title: "Members",
        icon: UsersRound,
        permissions: ["org.user.manage", "org.user.list"],
        path: "/dashboard/organization/members",
        pathRegex: /^\/dashboard\/organization\/members$/,
      },
      {
        title: "Invitations",
        icon: Mails,
        permissions: ["org.invitation.manage", "org.invitation.list"],
        path: "/dashboard/organization/invitations",
        pathRegex: /^\/dashboard\/organization\/invitations$/,
      },
      {
        title: "Roles & Permissions",
        icon: ShieldUser,
        permissions: ["org.role.manage", "org.role.list"],
        path: "/dashboard/organization/roles",
        pathRegex: /^\/dashboard\/organization\/roles$/,
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
