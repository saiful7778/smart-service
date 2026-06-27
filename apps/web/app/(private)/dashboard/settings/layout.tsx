import { Separator } from "@workspace/ui/components/separator";

import { DashboardShell } from "@/components/shared/DashboardShell";
import { SettingsSidebar } from "@/components/shared/sidebar/SettingsSidebar";

export default function SettingsLayout({
  children,
}: LayoutProps<"/dashboard/settings">) {
  return (
    <DashboardShell
      title="Settings"
      shortDescription="Manage your account and platform settings."
    >
      <div className="flex flex-col gap-8 lg:flex-row">
        <SettingsSidebar />
        <Separator orientation="vertical" className="hidden lg:block" />
        <div className="w-full flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </DashboardShell>
  );
}
