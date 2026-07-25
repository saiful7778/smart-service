"use client";

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

import { AdminSidebar } from "./AdminSidebar";
import { AppSidebar } from "./AppSidebar";

export function MainSidebar() {
  "use no memo";
  const isAdminUser = useAuthStore((state) => state.isAdminUser);

  if (isAdminUser) {
    return <AdminSidebar />;
  }

  return <AppSidebar />;
}
