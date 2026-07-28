import type { Metadata } from "next";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { getAuthUserWithRolesAndPermissionsWithOrgCache } from "@/features/auth/data/getAuthUser";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { user } = await getAuthUserWithRolesAndPermissionsWithOrgCache();

  return (
    <DashboardShell
      header={
        <div>
          <DashboardShellTitle>{`Welcome back, ${user.name}`}</DashboardShellTitle>
          <DashboardShellDescription>
            Manage your world and flex your power
          </DashboardShellDescription>
        </div>
      }
    ></DashboardShell>
  );
}
