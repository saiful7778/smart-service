import type { Metadata } from "next";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { getAuthUserWithRolesAndPermissionsWithContextCache } from "@/features/auth/data/getAuthUser";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { user } = await getAuthUserWithRolesAndPermissionsWithContextCache();

  return (
    <DashboardShell
      title={`Welcome admin, ${user.name}`}
      shortDescription="Manage your world and flex your power"
    ></DashboardShell>
  );
}
