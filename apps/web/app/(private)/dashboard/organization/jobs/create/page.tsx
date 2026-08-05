import { Metadata } from "next";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { JobCreateForm } from "@/features/job/components/forms/JobCreateForm";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Create Job",
};

export default async function CreateJobPage(
  props: PageProps<"/dashboard/organization/jobs/create">
) {
  await requireUserPermissionsWithOrgCache([
    "org.job.manage",
    "org.job.create",
  ]);

  const searchParams = await props.searchParams;
  const leadId = (searchParams?.leadId ?? undefined) as string | undefined;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    orpcTQClient.lead.listForSearch.queryOptions({
      input: {},
    })
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <div>
            <DashboardShellTitle>Create Job</DashboardShellTitle>
            <DashboardShellDescription>
              Create a new job
            </DashboardShellDescription>
          </div>
        }
      >
        <div className="max-w-4xl w-full mx-auto">
          <JobCreateForm leadId={leadId} />
        </div>
      </DashboardShell>
    </HydrateClient>
  );
}
