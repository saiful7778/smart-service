import type { BreadcrumbRoute, RoutePathType } from "@/types";

export const DEFAULT_AUTH_PATH: RoutePathType = "/dashboard";
export const DEFAULT_UNAUTH_PATH: RoutePathType = "/login";
export const ACCEPT_INVITATION_PATH: RoutePathType = "/accept-invitation";
export const CREATE_ORG_PATH: RoutePathType = "/organization/create";
export const RESET_PASSWORD_PATH: RoutePathType = "/reset-password";
export const ERROR_PAGE_PATH: RoutePathType = "/error";

export const DEFAULT_ADMIN_PATH: RoutePathType = "/dashboard/admin";

export const ONE_DAY_IN_MILISECOND = 24 * 60 * 60 * 1000;
export const UPLOAD_EXPIRED_TIME_IN_MILISECOND: number =
  ONE_DAY_IN_MILISECOND * 7;

export const AUTH_ROUTES: Array<RoutePathType> = [
  DEFAULT_UNAUTH_PATH,
  "/register",
  "/forget-password",
  RESET_PASSWORD_PATH,
];

export const navItems: Array<{
  name: string;
  href: RoutePathType;
}> = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
];

export const footerContent = {
  pages: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms & Conditions", href: "#" },
  ],
};

export const PUBLIC_ROUTES: Array<RoutePathType> = [
  ...AUTH_ROUTES,
  ...navItems.map((item) => item.href),
];

export const SUPPORTED_OAUTH_PROVIDERS = ["google"] as const;

export const breadcrumbRoutes: Array<BreadcrumbRoute> = [
  {
    title: "Dashboard",
    path: "/dashboard",
    children: [
      {
        title: "All Users",
        path: "/dashboard/admin/users",
      },
      {
        title: "Settings",
        path: "/dashboard/settings",
        children: [
          {
            title: "Profile",
            path: "/dashboard/settings/profile",
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
        ],
      },
    ],
  },
];
