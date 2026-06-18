import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { RoleManagementTable } from "@/features/role/components/RoleManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export default async function RolesPage() {
  await requireUserPermissionsWithOrgCache(["system.role.list"]);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpcTQClient.role.listRole.queryOptions());

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        title="Roles & Permissions"
        shortDescription="Manage application user roles and permissions"
      >
        <RoleManagementTable />
      </DashboardShell>
    </HydrateClient>
  );
}
