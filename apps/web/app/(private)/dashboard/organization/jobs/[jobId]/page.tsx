import { Metadata } from "next";

import { ArrowLeft, Eye, FileText, Receipt } from "lucide-react";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";

import { AttachmentStep } from "@/features/job/components/job-details/AttachmentStep";
import { DetailsStep } from "@/features/job/components/job-details/details-step";
import { EstimateStep } from "@/features/job/components/job-details/EstimateStep";
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

  const { data } = await queryclient.fetchQuery(
    orpcTQClient.job.details.queryOptions({
      input: {
        jobId,
      },
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        className="max-w-5xl mx-auto w-full"
        header={
          <div>
            <LinkButton href="/dashboard/organization/jobs">
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
            <DashboardShellTitle>{data.title}</DashboardShellTitle>
            <DashboardShellDescription>
              Detailed overview of job information and performance.
            </DashboardShellDescription>
          </div>
        }
      >
        <TabNavigation defaultValue="details">
          <TabNavigationList variant="line">
            <TabNavigationTrigger value="details">
              <Eye className="size-4" />
              <span>Overview</span>
            </TabNavigationTrigger>
            <TabNavigationTrigger value="estimates">
              <Receipt className="size-4" />
              <span>Estimates</span>
            </TabNavigationTrigger>
            <TabNavigationTrigger value="attachments">
              <FileText className="size-4" />
              <span>Attachments</span>
            </TabNavigationTrigger>
          </TabNavigationList>

          <TabNavigationContent value="details">
            <DetailsStep jobId={jobId} />
          </TabNavigationContent>
          <TabNavigationContent value="estimates">
            <EstimateStep leadId={data.leadId} jobId={jobId} />
          </TabNavigationContent>
          <TabNavigationContent value="attachments">
            <AttachmentStep leadId={data.leadId} jobId={jobId} />
          </TabNavigationContent>
        </TabNavigation>
      </DashboardShell>
    </HydrateClient>
  );
}
