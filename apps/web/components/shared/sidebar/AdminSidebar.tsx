import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@workspace/ui/components/sidebar";

import { AdminSidebarMenu } from "./AdminSidebarMenu";
import { SidebarFooterMenu } from "./SidebarFooterMenu";
import { SidebarLogo } from "./SidebarLogo";

type AdminSidebarProps = React.ComponentProps<typeof Sidebar>;

export function AdminSidebar({ ...props }: AdminSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu className="gap-2">
          <SidebarLogo />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminSidebarMenu />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
