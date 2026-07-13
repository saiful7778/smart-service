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
): Array<SidebarGroupMenuLink> {
  const filteredMenu: Array<SidebarGroupMenuLink> = [];

  for (const menuGroup of menuItems) {
    const filteredItems = filterMenuItems(
      menuGroup.items,
      userPermissions,
      userId,
      orgId
    );

    if (filteredItems.length > 0) {
      filteredMenu.push({
        ...menuGroup,
        items: filteredItems,
      });
    }
  }
  return filteredMenu;
}

function filterMenuItems(
  items: Array<SidebarMenuLink>,
  userPermissions: Array<PermissionWithOrg>,
  userId: string,
  orgId?: string | null | undefined
): Array<SidebarMenuLink> {
  const filteredItems: Array<SidebarMenuLink> = [];

  for (const menuItem of items) {
    let isAllowed = true;

    if (menuItem.permissions) {
      isAllowed = hasPermissionWithOrg(userPermissions, menuItem.permissions, {
        orgId,
        userId,
      });
    }

    let filteredNestedItems: Array<SidebarMenuLink> | undefined;
    if (menuItem.items && menuItem.items.length > 0) {
      filteredNestedItems = filterMenuItems(
        menuItem.items,
        userPermissions,
        userId,
        orgId
      );
    }

    let shouldInclude = false;

    if (isAllowed) {
      shouldInclude = true;

      if (
        filteredNestedItems !== undefined &&
        filteredNestedItems.length === 0
      ) {
        shouldInclude = true;
      }
    } else {
      if (filteredNestedItems !== undefined && filteredNestedItems.length > 0) {
        shouldInclude = true;
      }
    }

    if (shouldInclude) {
      const newItem = { ...menuItem };
      if (filteredNestedItems !== undefined) {
        newItem.items = filteredNestedItems;
      }
      filteredItems.push(newItem);
    }
  }

  return filteredItems;
}
