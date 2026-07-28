import { parseAsArrayOf, parseAsIsoDate } from "nuqs/server";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { MaterialBinManagementTable } from "@/features/material/components/material-bin-table/MaterialBinManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export default async function MaterialBinPage(
  props: PageProps<"/dashboard/organization/materials/bin">
) {
  await requireUserPermissionsWithOrgCache([
    "org.material.manage",
    "org.material.delete",
  ]);

  const queryClient = getQueryClient();

  const filters = await tableQuerySearchParams({
    deletedAt: parseAsArrayOf(parseAsIsoDate, ",").withOptions({
      clearOnDefault: true,
    }),
  })(props.searchParams);

  const searchFields = ["name", "sku"];

  await queryClient.prefetchQuery(
    orpcTQClient.material.bin.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        searchFields,
        filter: {
          deletedAt: filters.deletedAt
            ? { from: filters.deletedAt[0], to: filters.deletedAt[1] }
            : undefined,
        },
      },
    })
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <div>
            <DashboardShellTitle>Material Recycle Bin</DashboardShellTitle>
            <DashboardShellDescription>
              Restore or permanently delete removed materials
            </DashboardShellDescription>
          </div>
        }
      >
        <MaterialBinManagementTable
          page={filters.page}
          limit={filters.limit}
          search={filters.search}
          searchFields={searchFields}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
