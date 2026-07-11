import { Metadata } from "next";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { JobCreateForm } from "@/features/job/components/forms/JobCreateForm";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Create Job",
};

export default async function CreateJobPage() {
  await requireUserPermissionsWithOrgCache([
    "org.job.manage",
    "org.job.create",
  ]);
  const queryClient = getQueryClient();

  await queryClient.ensureQueryData(
    orpcTQClient.job.listServicings.queryOptions()
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell title="Create Job" shortDescription="Create a new job">
        <div className="max-w-4xl w-full mx-auto">
          <JobCreateForm />
        </div>
      </DashboardShell>
    </HydrateClient>
  );
}
