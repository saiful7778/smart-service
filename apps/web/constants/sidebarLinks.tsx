import {
  Boxes,
  House,
  List,
  ListTree,
  Mails,
  Package,
  PlusCircle,
  Settings,
  ShieldUser,
  Trash2,
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
        title: "All Users",
        icon: UsersRound,
        permissions: ["system.user.manage", "system.user.list"],
        path: "/dashboard/admin/users",
        pathRegex: /^\/dashboard\/admin\/users(\/.*)?$/,
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
      {
        title: "Leads",
        icon: UsersRound,
        permissions: ["org.lead.manage", "org.lead.list"],
        path: "/dashboard/organization/leads",
        pathRegex: /^\/dashboard\/organization\/leads(\/.*)?$/,
        items: [
          {
            title: "All Leads",
            icon: List,
            permissions: ["org.lead.manage", "org.lead.list"],
            path: "/dashboard/organization/leads",
            pathRegex: /^\/dashboard\/organization\/leads$/,
          },
          {
            title: "Create Lead",
            icon: PlusCircle,
            permissions: ["org.lead.manage", "org.lead.create"],
            path: "/dashboard/organization/leads/create",
            pathRegex: /^\/dashboard\/organization\/leads\/create$/,
          },
          {
            title: "Categories",
            icon: ListTree,
            permissions: ["org.lead_category.manage", "org.lead_category.list"],
            path: "/dashboard/organization/leads/categories",
            pathRegex: /^\/dashboard\/organization\/leads\/categories$/,
          },
          {
            title: "Recycle Bin",
            icon: Trash2,
            permissions: ["org.lead.manage", "org.lead.delete"],
            path: "/dashboard/organization/leads/bin",
            pathRegex: /^\/dashboard\/organization\/leads\/bin$/,
          },
        ],
      },
      {
        title: "Jobs",
        icon: Package,
        permissions: ["org.job.manage", "org.job.list"],
        path: "/dashboard/organization/jobs",
        pathRegex: /^\/dashboard\/organization\/jobs(\/.*)?$/,
        items: [
          {
            icon: List,
            title: "All Jobs",
            permissions: ["org.job.manage", "org.job.list"],
            path: "/dashboard/organization/jobs",
            pathRegex: /^\/dashboard\/organization\/jobs$/,
          },
          {
            icon: PlusCircle,
            title: "Create Job",
            permissions: ["org.job.manage", "org.job.create"],
            path: "/dashboard/organization/jobs/create",
            pathRegex: /^\/dashboard\/organization\/jobs\/create$/,
          },
          {
            title: "Recycle Bin",
            icon: Trash2,
            permissions: ["org.job.manage", "org.job.delete"],
            path: "/dashboard/organization/jobs/bin",
            pathRegex: /^\/dashboard\/organization\/jobs\/bin$/,
          },
        ],
      },
      {
        title: "Materials",
        icon: Boxes,
        permissions: ["org.material.manage", "org.material.list"],
        path: "/dashboard/organization/materials",
        pathRegex: /^\/dashboard\/organization\/materials(\/.*)?$/,
        items: [
          {
            icon: List,
            title: "All Materials",
            permissions: ["org.material.manage", "org.material.list"],
            path: "/dashboard/organization/materials",
            pathRegex: /^\/dashboard\/organization\/materials$/,
          },
        ],
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
