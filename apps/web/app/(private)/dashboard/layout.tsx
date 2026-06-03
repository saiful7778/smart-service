import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

import { AdminSidebar } from "@/components/shared/sidebar/AdminSidebar";
import { AppSidebar } from "@/components/shared/sidebar/AppSidebar";
import { Topbar } from "@/components/shared/topbar";

import { getAuthUserWithRolesAndPermissionsWithContextCache } from "@/features/auth/data/getAuthUser";
import { getActiveOrgCache } from "@/features/org/data/get-active-org";
import { getOrgListCache } from "@/features/org/data/get-org-list";
import { OrgStoreProvider } from "@/stores/zustand/org/OrgStoreContext";
import { isAdmin } from "@/utils/user-utils";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { user, session, roles } =
    await getAuthUserWithRolesAndPermissionsWithContextCache();

  const isAdminUser = isAdmin(roles);

  const orgs = isAdminUser ? [] : await getOrgListCache(user.id);

  const activeOrg =
    session.activeOrganizationId && orgs.length > 0
      ? await getActiveOrgCache(session.activeOrganizationId)
      : undefined;

  return (
    <OrgStoreProvider organizations={orgs} activeOrg={activeOrg}>
      <SidebarProvider>
        {isAdminUser ? <AdminSidebar /> : <AppSidebar />}
        <SidebarInset>
          <Topbar />
          <main className="min-h-[calc(100vh-84px)] flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </OrgStoreProvider>
  );
}
