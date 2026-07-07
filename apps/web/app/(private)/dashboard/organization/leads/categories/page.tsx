import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { LeadCategoryManagementTable } from "@/features/lead/components/LeadCategoryManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export default async function CategoriesPage() {
  await requireUserPermissionsWithOrgCache([
    "org.lead_category.manage",
    "org.lead_category.read",
  ]);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    orpcTQClient.lead.category.list.queryOptions()
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        title="Categories"
        shortDescription="Manage your lead categories"
      >
        <LeadCategoryManagementTable />
      </DashboardShell>
    </HydrateClient>
  );
}
