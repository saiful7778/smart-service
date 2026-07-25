import { Metadata } from "next";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { UserManagementTable } from "@/features/user/components/user-table/UserManagementTable";
import { UserStats } from "@/features/user/components/UserStats";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "User management",
};

export default async function UsersPage(
  props: PageProps<"/dashboard/admin/users">
) {
  await requireUserPermissionsWithOrgCache([
    "system.user.manage",
    "system.user.list",
  ]);

  const filters = await tableQuerySearchParams({})(props.searchParams);

  const searchFields = ["name", "email"];

  const queryclient = getQueryClient();

  await queryclient.prefetchQuery(
    orpcTQClient.user.list.queryOptions({
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

  await queryclient.prefetchQuery(orpcTQClient.user.stats.queryOptions());

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        title="User Management"
        shortDescription="Manage your users"
      >
        <UserStats />
        <UserManagementTable
          page={filters.page}
          limit={filters.limit}
          search={filters.search}
          searchFields={searchFields}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
