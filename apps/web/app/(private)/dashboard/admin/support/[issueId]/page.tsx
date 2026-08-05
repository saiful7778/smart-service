import { Metadata } from "next";

import { ArrowLeft } from "lucide-react";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { FeedbackIssueDetails } from "@/features/feedback/components/FeedbackIssueDetails";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Support issue",
};

export default async function AdminSupportIssueDetailsPage(
  props: PageProps<"/dashboard/admin/support/[issueId]">
) {
  const { issueId } = await props.params;

  const { user } = await requireUserPermissionsWithOrgCache([
    "system.feedback.read",
  ]);

  const queryClient = getQueryClient();

  const { data } = await queryClient.fetchQuery(
    orpcTQClient.feedback.details.queryOptions({
      input: { issueId },
    })
  );

  const isOwner = data.createdByUser.id === user.id;

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        className="max-w-5xl w-full mx-auto"
        header={
          <div>
            <LinkButton href="/dashboard/admin/support">
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
            <DashboardShellTitle>Support issue</DashboardShellTitle>
            <DashboardShellDescription>
              Reply and manage the issue status
            </DashboardShellDescription>
          </div>
        }
      >
        <FeedbackIssueDetails issueId={issueId} isOwner={isOwner} isAgent />
      </DashboardShell>
    </HydrateClient>
  );
}
