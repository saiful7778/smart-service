import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { OrgRoleManagementTable } from "@/features/role/components/OrgRoleManagementTable";
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
        title="Roles & Permissions"
        shortDescription="Manage application user roles and permissions"
      >
        <OrgRoleManagementTable />
      </DashboardShell>
    </HydrateClient>
  );
}
