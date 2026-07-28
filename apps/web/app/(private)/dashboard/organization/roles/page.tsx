import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { OrgRoleManagementTable } from "@/features/role/components/org-role-table/OrgRoleManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export default async function RolesPage() {
  await requireUserPermissionsWithOrgCache(["org.role.list"]);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpcTQClient.role.listOrgRole.queryOptions());
  await queryClient.prefetchQuery(
    orpcTQClient.role.listOrgPermission.queryOptions()
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <div>
            <DashboardShellTitle>Roles & Permissions</DashboardShellTitle>
            <DashboardShellDescription>
              Manage application user roles and permissions
            </DashboardShellDescription>
          </div>
        }
      >
        <OrgRoleManagementTable />
      </DashboardShell>
    </HydrateClient>
  );
}
