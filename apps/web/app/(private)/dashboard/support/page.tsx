import { Metadata } from "next";

import { parseAsStringEnum } from "nuqs/server";

import {
  FeedbackIssueStatusEnumSchema,
  FeedbackIssueTypeEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { CreateFeedbackIssueDialog } from "@/features/feedback/components/CreateFeedbackIssueDialog";
import { FeedbackIssueList } from "@/features/feedback/components/FeedbackIssueList";
import { orpcTQClient } from "@/server/orpc.client";

export const metadata: Metadata = {
  title: "Support",
};

export default async function SupportPage(
  props: PageProps<"/dashboard/support">
) {
  const filters = await tableQuerySearchParams({
    type: parseAsStringEnum(FeedbackIssueTypeEnumSchema.options).withOptions({
      clearOnDefault: true,
    }),
    status: parseAsStringEnum(
      FeedbackIssueStatusEnumSchema.options
    ).withOptions({
      clearOnDefault: true,
    }),
  })(props.searchParams);

  const searchFields = ["title"];

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    orpcTQClient.feedback.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          type: filters.type ?? undefined,
          status: filters.status ?? undefined,
        },
      },
    })
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        className="max-w-3xl w-full mx-auto"
        header={
          <div>
            <DashboardShellTitle>Support</DashboardShellTitle>
            <DashboardShellDescription>
              Submit feedback and track the issues
            </DashboardShellDescription>
          </div>
        }
      >
        <div className="flex w-full flex-col gap-4">
          <CreateFeedbackIssueDialog />
          <FeedbackIssueList
            page={filters.page}
            limit={filters.limit}
            search={filters.search}
            searchFields={searchFields}
            basePath="/dashboard/support"
          />
        </div>
      </DashboardShell>
    </HydrateClient>
  );
}
