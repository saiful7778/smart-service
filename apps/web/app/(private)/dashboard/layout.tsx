import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

import { MainSidebar } from "@/components/shared/sidebar/MainSidebar";
import { Topbar } from "@/components/shared/topbar";

import { NotificationPermissionProvider } from "@/features/notification/components/NotificationPermissionProvider";
import { NotificationProvider } from "@/features/notification/components/NotificationProvider";
import { NotificationStoreContextProvider } from "@/stores/zustand/notification/NotificationStoreContext";
import { OrgStoreProvider } from "@/stores/zustand/org/OrgStoreContext";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <OrgStoreProvider>
      <NotificationStoreContextProvider>
        <NotificationPermissionProvider>
          <NotificationProvider>
            <SidebarProvider>
              <MainSidebar />
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
