import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { RoleManagementTable } from "@/features/role/components/role-table/RoleManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export default async function RolesPage() {
  await requireUserPermissionsWithOrgCache(["system.role.list"]);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpcTQClient.role.listRole.queryOptions());

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <div>
            <DashboardShellTitle>Roles & Permissions</DashboardShellTitle>
            <DashboardShellDescription>Manage application user roles and permissions</DashboardShellDescription>
          </div>
        }
      >
        <RoleManagementTable />
      </DashboardShell>
    </HydrateClient>
  );
}
