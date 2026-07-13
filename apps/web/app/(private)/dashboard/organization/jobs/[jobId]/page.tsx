import { Metadata } from "next";

import { Eye, FileText } from "lucide-react";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";
import { UserAvatar } from "@/components/UserAvatar";

import { AttachmentStep } from "@/features/job/components/job-details/AttachmentStep";
import { DetailsStep } from "@/features/job/components/job-details/details-step";
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
        backUrl="/dashboard/organization/jobs"
        title={data.title}
        shortDescription="Detailed overview of job information and performance."
      >
        <div className="space-y-2">
          <div className="text-sm font-bold leading-none">Created by</div>
          <div className="bg-card py-2 px-3 rounded-lg border shadow-sm w-fit">
            {data.createdByMember && (
              <UserAvatar
                userName={data.createdByMember.name}
                userEmail={data.createdByMember.email}
                imageUrl={data.createdByMember.image}
                userRoles={data.createdByMember.roles}
                showDetails
                showRoleDetails
              />
            )}
          </div>
        </div>

        <TabNavigation defaultValue="details">
          <TabNavigationList variant="line">
            <TabNavigationTrigger value="details">
              <Eye className="size-4" />
              <span>Overview</span>
            </TabNavigationTrigger>
            <TabNavigationTrigger value="attachments">
              <FileText className="size-4" />
              <span>Attachments</span>
            </TabNavigationTrigger>
          </TabNavigationList>

          <TabNavigationContent value="details">
            <DetailsStep jobId={jobId} />
          </TabNavigationContent>
          <TabNavigationContent value="attachments">
            <AttachmentStep leadId={data.leadId} jobId={jobId} />
          </TabNavigationContent>
        </TabNavigation>
      </DashboardShell>
    </HydrateClient>
  );
}
