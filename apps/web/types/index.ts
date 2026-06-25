import type { RouteType } from "next/dist/lib/load-custom-routes";

import { LucideIcon } from "lucide-react";

import { PermissionDataModel } from "@workspace/drizzle/schemas";
import { RoleEnumType } from "@workspace/drizzle/zod-db-enums";

import { PermissionType } from "@/lib/permission";

export type AuthUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  banned: boolean | null | undefined;
  role?: string | null | undefined;
  banReason?: string | null | undefined;
  banExpires?: Date | null | undefined;
};

export type AuthSession = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  activeOrganizationId?: string | null | undefined;
  activeTeamId?: string | null | undefined;
  impersonatedBy?: string | null | undefined;
};

export interface FieldError<TFieldNames> {
  fieldName: TFieldNames;
  message: string;
}

export interface IApiHookInput<TFieldNames = string> {
  onRequestStart?: () => void;
  onRequestEnd?: () => void;
  onSuccess?: (message: string) => void;
  onError?: (errorMessage: string) => void;
  onValidationErrors?: (fields: Array<FieldError<TFieldNames>>) => void;
}

export interface RoleWithOrg {
  roleName: RoleEnumType | string;
  orgId: string | undefined;
  orgSlug: string | undefined;
}

export interface PermissionWithOrg extends Pick<
  PermissionDataModel,
  "name" | "level" | "resource" | "action"
> {
  source: "SYSTEM" | "ORG";
  orgId: string | undefined;
  orgSlug: string | undefined;
}

export type RoutePathType = __next_route_internal_types__.RouteImpl<RouteType>;

export type SidebarMenuLink = {
  title: string;
  path: string;
  pathRegex: RegExp;
  icon?: LucideIcon | undefined;
  items?: Array<SidebarMenuLink> | undefined;
  permissions?: Array<PermissionType>;
};

export type SidebarGroupMenuLink = {
  groupName?: string;
  items: Array<SidebarMenuLink>;
};

export type BreadcrumbRoute = {
  title: string;
  path: string;
  children?: BreadcrumbRoute[];
};
