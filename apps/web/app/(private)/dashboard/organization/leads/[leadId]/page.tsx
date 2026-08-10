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
import { LeadDetails } from "@/features/lead/components/lead-details";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Lead details",
};

export default async function SingleLeadDetailsPage(
  props: PageProps<"/dashboard/organization/leads/[leadId]">
) {
  await requireUserPermissionsWithOrgCache([
    "org.lead.manage",
    "org.lead.read",
  ]);

  const { leadId } = await props.params;

  const queryclient = getQueryClient();

  await queryclient.prefetchQuery(
    orpcTQClient.lead.details.queryOptions({
      input: {
        leadId,
      },
    })
  );

  await queryclient.prefetchInfiniteQuery(
    orpcTQClient.lead.note.list.infiniteOptions({
      input: (pageParam) => ({
        leadId,
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
            <LinkButton href="/dashboard/organization/leads">
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
          </DashboardShellHeader>
        }
      >
        <LeadDetails leadId={leadId} />
      </DashboardShell>
    </HydrateClient>
  );
}
