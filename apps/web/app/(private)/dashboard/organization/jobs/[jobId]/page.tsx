import { Metadata } from "next";

import { ArrowLeft } from "lucide-react";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { DashboardShellHeader } from "@/components/shared/dashboard-shell/DashboardShellHeader";

import {
  DEFAULT_INFINITE_PAGE_SIZE,
  DEFAULT_INFINITE_PAGE_START,
} from "@/constants";
import { JobDetails } from "@/features/job/components/job-details";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Job Details",
};

export default async function SingleJobDetailsPage(
  props: PageProps<"/dashboard/organization/jobs/[jobId]">
) {
  await requireUserPermissionsWithOrgCache(["org.job.manage", "org.job.read"]);
  const { jobId } = await props.params;

  const queryclient = getQueryClient();

  await queryclient.prefetchQuery(
    orpcTQClient.job.details.queryOptions({
      input: {
        jobId,
      },
    })
  );

  await queryclient.prefetchInfiniteQuery(
    orpcTQClient.lead.note.list.infiniteOptions({
      input: (pageParam) => ({
        jobId,
        order: "desc",
        orderField: "createdAt",
        page: pageParam,
        limit: DEFAULT_INFINITE_PAGE_SIZE,
      }),
      getNextPageParam: ({ data }) => data.meta.nextPage ?? undefined,
      initialPageParam: DEFAULT_INFINITE_PAGE_START,
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        className="max-w-5xl mx-auto w-full"
        header={
          <DashboardShellHeader>
            <LinkButton href="/dashboard/organization/jobs">
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
          </DashboardShellHeader>
        }
      >
        <JobDetails jobId={jobId} />
      </DashboardShell>
    </HydrateClient>
  );
}
