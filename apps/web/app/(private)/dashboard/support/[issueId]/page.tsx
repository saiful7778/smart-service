import { Metadata } from "next";

import { ArrowLeft } from "lucide-react";

import { hasPermission } from "@/lib/permission";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { getAuthUserWithRolesAndPermissionsWithOrgCache } from "@/features/auth/data/getAuthUser";
import { FeedbackIssueDetails } from "@/features/feedback/components/FeedbackIssueDetails";
import { orpcTQClient } from "@/server/orpc.client";

export const metadata: Metadata = {
  title: "Support issue",
};

export default async function SupportIssueDetailsPage(
  props: PageProps<"/dashboard/support/[issueId]">
) {
  const { issueId } = await props.params;

  const { user, permissions } =
    await getAuthUserWithRolesAndPermissionsWithOrgCache();

  const isAgent = hasPermission(permissions ?? [], ["system.feedback.update"], {
    userId: user.id,
  });

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
            <LinkButton href="/dashboard/support">
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
            <DashboardShellTitle>Support issue</DashboardShellTitle>
            <DashboardShellDescription>
              View details and replies
            </DashboardShellDescription>
          </div>
        }
      >
        <FeedbackIssueDetails
          issueId={issueId}
          isOwner={isOwner}
          isAgent={isAgent}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
