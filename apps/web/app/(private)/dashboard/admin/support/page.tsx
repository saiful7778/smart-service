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

import { FeedbackIssueList } from "@/features/feedback/components/FeedbackIssueList";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Support issues",
};

export default async function AdminSupportPage(
  props: PageProps<"/dashboard/admin/support">
) {
  await requireUserPermissionsWithOrgCache(["system.feedback.list"]);

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
        className="w-full max-w-3xl mx-auto"
        header={
          <div>
            <DashboardShellTitle>Support issues</DashboardShellTitle>
            <DashboardShellDescription>
              Manage all user feedback issues and requests
            </DashboardShellDescription>
          </div>
        }
      >
        <FeedbackIssueList
          page={filters.page}
          limit={filters.limit}
          search={filters.search}
          searchFields={searchFields}
          basePath="/dashboard/admin/support"
        />
      </DashboardShell>
    </HydrateClient>
  );
}
