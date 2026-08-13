import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { MemberManagementTable } from "@/features/org/components/member-table/MemberManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export default async function MemberPage(
  props: PageProps<"/dashboard/organization/members">
) {
  await requireUserPermissionsWithOrgCache([
    "org.user.manage",
    "org.user.list",
  ]);

  const queryClient = getQueryClient();

  const filters = await tableQuerySearchParams({})(props.searchParams);

  const searchFields = ["name", "email"];

  await queryClient.prefetchQuery(
    orpcTQClient.org.listMember.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
      },
    })
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <DashboardShellHeader>
            <DashboardShellTitle>Members</DashboardShellTitle>
            <DashboardShellDescription>
              Manage the users who have access to your organization.
            </DashboardShellDescription>
          </DashboardShellHeader>
        }
      >
        <MemberManagementTable searchFields={searchFields} />
      </DashboardShell>
    </HydrateClient>
  );
}
