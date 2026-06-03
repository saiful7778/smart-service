import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@workspace/ui/components/sidebar";

import { OrgSelector } from "@/features/org/components/OrgSelector";

import { SidebarFooterMenu } from "./SidebarFooterMenu";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarMainMenu } from "./SidebarMainMenu";

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu className="gap-2">
          <SidebarLogo />
          <OrgSelector />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMainMenu />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
