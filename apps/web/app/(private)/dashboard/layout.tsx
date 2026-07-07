import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

import { AdminSidebar } from "@/components/shared/sidebar/AdminSidebar";
import { AppSidebar } from "@/components/shared/sidebar/AppSidebar";
import { Topbar } from "@/components/shared/topbar";

import { getAuthUserWithRolesAndPermissionsWithOrgCache } from "@/features/auth/data/getAuthUser";
import { NotificationPermissionProvider } from "@/features/notification/components/NotificationPermissionProvider";
import { NotificationProvider } from "@/features/notification/components/NotificationProvider";
import { getActiveOrgCache } from "@/features/org/data/get-active-org";
import { getOrgListCache } from "@/features/org/data/get-org-list";
import { getOrgRolesCache } from "@/features/org/data/get-org-roles";
import { orpcClient } from "@/server/orpc.client";
import { NotificationStoreContextProvider } from "@/stores/zustand/notification/NotificationStoreContext";
import { OrgStoreProvider } from "@/stores/zustand/org/OrgStoreContext";
import { isAdmin } from "@/utils/user-utils";

/* ---------- Next.js cache control ---------- */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
/* ------------------------------------------- */

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { user, session, roles } =
    await getAuthUserWithRolesAndPermissionsWithOrgCache();

  const isAdminUser = isAdmin(roles);

  const orgs = isAdminUser ? [] : await getOrgListCache(user.id);

  const activeOrg =
    session.activeOrganizationId && orgs.length > 0
      ? await getActiveOrgCache(session.activeOrganizationId)
      : undefined;

  const orgRoles = activeOrg ? await getOrgRolesCache(activeOrg.id) : [];

  const notifications = await orpcClient.notification.list({
    page: 1,
    limit: 10,
  });

  return (
    <OrgStoreProvider
      organizations={orgs}
      activeOrg={activeOrg}
      orgRoles={orgRoles}
    >
      <NotificationStoreContextProvider
        initialNotifications={notifications.data.data}
      >
        <NotificationPermissionProvider>
          <NotificationProvider>
            <SidebarProvider>
              {isAdminUser ? <AdminSidebar /> : <AppSidebar />}
              <SidebarInset>
                <Topbar />
                <main className="min-h-[calc(100vh-84px)] flex-1">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </NotificationProvider>
        </NotificationPermissionProvider>
      </NotificationStoreContextProvider>
    </OrgStoreProvider>
  );
}
