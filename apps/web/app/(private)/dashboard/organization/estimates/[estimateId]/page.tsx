import { Metadata } from "next";
import { redirect } from "next/navigation";

import { createLoader, parseAsString } from "nuqs/server";

import { ArrowLeft } from "lucide-react";

import { env } from "@/lib/env";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { DEFAULT_AUTH_PATH } from "@/constants";
import { LeadEstimateDetails } from "@/features/lead/components/lead-estimate/LeadEstimateDetails";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Estimate Details",
};

export default async function EstimateDetailsPage(
  props: PageProps<"/dashboard/organization/estimates/[estimateId]">
) {
  const { leadId, jobId, redirectTo } = await createLoader({
    leadId: parseAsString.withOptions({ clearOnDefault: true }),
    jobId: parseAsString.withOptions({ clearOnDefault: true }),
    redirectTo: parseAsString.withOptions({ clearOnDefault: true }),
  })(props.searchParams);

  if (!leadId && !jobId) {
    throw redirect(DEFAULT_AUTH_PATH);
  }

  const redirectUrl = new URL(
    redirectTo || DEFAULT_AUTH_PATH,
    env.NEXT_PUBLIC_SITE_URL
  );

  await requireUserPermissionsWithOrgCache(
    leadId
      ? ["org.lead_estimate.manage", "org.lead_estimate.read"]
      : jobId
        ? ["org.job_estimate.manage", "org.job_estimate.read"]
        : [
            "org.lead_estimate.manage",
            "org.lead_estimate.read",
            "org.job_estimate.manage",
            "org.job_estimate.read",
          ]
  );

  const { estimateId } = await props.params;

  const queryclient = getQueryClient();

  const { data } = await queryclient.fetchQuery(
    orpcTQClient.lead.estimate.details.queryOptions({
      input: {
        leadId,
        jobId,
        estimateId,
      },
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        className="max-w-5xl mx-auto w-full"
        header={
          <div>
            <LinkButton href={{ pathname: redirectUrl.pathname, search: redirectUrl.search }}>
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
            <DashboardShellTitle>{data.name}</DashboardShellTitle>
            <DashboardShellDescription>
              Detailed overview of estimate information.
            </DashboardShellDescription>
          </div>
        }
      >
        <LeadEstimateDetails
          estimateData={data}
          leadId={leadId}
          jobId={jobId}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
