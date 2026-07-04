import { hasPermissionWithOrg } from "@/lib/permission";

import {
  PermissionWithOrg,
  SidebarGroupMenuLink,
  SidebarMenuLink,
} from "@/types";

export function filterSidebarMenu(
  menuItems: Array<SidebarGroupMenuLink>,
  userPermissions: Array<PermissionWithOrg>,
  userId: string,
  orgId?: string | null | undefined
) {
  const filteredMenu: Array<SidebarGroupMenuLink> = [];

  for (const menuGroup of menuItems) {
    const filteredItems: Array<SidebarMenuLink> = [];

    for (const menuItem of menuGroup.items) {
      if (menuItem.permissions) {
        const isAllowed = hasPermissionWithOrg(
          userPermissions,
          menuItem.permissions,
          {
            orgId,
            userId,
          }
        );

        if (isAllowed) {
          filteredItems.push(menuItem);
        }
      } else {
        filteredItems.push(menuItem);
      }
    }
    if (filteredItems.length > 0) {
      filteredMenu.push({ ...menuGroup, items: filteredItems });
    }
  }
  return filteredMenu;
}
