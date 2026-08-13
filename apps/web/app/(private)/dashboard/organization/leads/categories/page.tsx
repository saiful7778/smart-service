import { Metadata } from "next";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { LeadCategoryManagementTable } from "@/features/lead/components/lead-category-table/LeadCategoryManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Lead Categories",
};

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
        header={
          <DashboardShellHeader>
            <DashboardShellTitle>Categories</DashboardShellTitle>
            <DashboardShellDescription>
              Manage your lead categories
            </DashboardShellDescription>
          </DashboardShellHeader>
        }
      >
        <LeadCategoryManagementTable />
      </DashboardShell>
    </HydrateClient>
  );
}
