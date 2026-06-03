import {
  RoleWithContext,
  SidebarGroupMenuLink,
  SidebarMenuLink,
} from "@/types";

export function filterSidebarMenu(
  menuItems: Array<SidebarGroupMenuLink>,
  userRoles: Array<RoleWithContext>
) {
  const filteredMenu: Array<SidebarGroupMenuLink> = [];

  for (const menuGroup of menuItems) {
    const filteredItems: Array<SidebarMenuLink> = [];

    for (const menuItem of menuGroup.items) {
      if (menuItem.roles) {
        const isAllowed = menuItem.roles.some((menuRole) =>
          userRoles.some((userRole) => userRole.roleName === menuRole)
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
