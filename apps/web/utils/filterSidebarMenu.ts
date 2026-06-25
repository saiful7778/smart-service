import { hasPermission } from "@/lib/permission";

import {
  PermissionWithOrg,
  SidebarGroupMenuLink,
  SidebarMenuLink,
} from "@/types";

export function filterSidebarMenu(
  menuItems: Array<SidebarGroupMenuLink>,
  userPermissions: Array<PermissionWithOrg>,
  userId: string
) {
  const filteredMenu: Array<SidebarGroupMenuLink> = [];

  for (const menuGroup of menuItems) {
    const filteredItems: Array<SidebarMenuLink> = [];

    for (const menuItem of menuGroup.items) {
      if (menuItem.permissions) {
        const isAllowed = hasPermission(userPermissions, menuItem.permissions, {
          userId,
        });

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
