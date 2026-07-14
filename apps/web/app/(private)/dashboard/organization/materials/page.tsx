import { Metadata } from "next";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { MaterialManagementTable } from "@/features/material/components/material-table/MaterialManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Materials",
};

export default async function MaterialsPage(
  props: PageProps<"/dashboard/organization/materials">
) {
  await requireUserPermissionsWithOrgCache([
    "org.material.manage",
    "org.material.list",
  ]);

  const queryClient = getQueryClient();

  const filters = await tableQuerySearchParams({})(props.searchParams);

  const searchFields = ["name", "sku"];

  await queryClient.prefetchQuery(
    orpcTQClient.material.list.queryOptions({
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
        title="Materials"
        shortDescription="Manage your organization materials"
      >
        <MaterialManagementTable
          limit={filters.limit}
          page={filters.page}
          search={filters.search}
          searchFields={searchFields}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
