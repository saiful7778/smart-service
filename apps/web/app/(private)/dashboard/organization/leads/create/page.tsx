import { Metadata } from "next";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { LeadCreateForm } from "@/features/lead/components/LeadCreateForm";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Create Lead",
};

export default async function CreateLeadPage() {
  await requireUserPermissionsWithOrgCache([
    "org.lead.manage",
    "org.lead.create",
  ]);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    orpcTQClient.lead.category.list.queryOptions()
  );
  await queryClient.prefetchQuery(
    orpcTQClient.lead.customer.listForSearch.queryOptions({
      input: {},
    })
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <div>
            <DashboardShellTitle>Create Lead</DashboardShellTitle>
            <DashboardShellDescription>
              Create a new lead in your organization.
            </DashboardShellDescription>
          </div>
        }
      >
        <div className="max-w-4xl w-full mx-auto">
          <LeadCreateForm />
        </div>
      </DashboardShell>
    </HydrateClient>
  );
}
