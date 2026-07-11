import { parseAsArrayOf, parseAsIsoDate } from "nuqs/server";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { JobBinManagementTable } from "@/features/job/components/JobBinManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export default async function JobBinPage(
  props: PageProps<"/dashboard/organization/jobs/bin">
) {
  await requireUserPermissionsWithOrgCache([
    "org.job.manage",
    "org.job.delete",
  ]);

  const queryClient = getQueryClient();

  const filters = await tableQuerySearchParams({
    deletedAt: parseAsArrayOf(parseAsIsoDate, ",").withOptions({
      clearOnDefault: true,
    }),
  })(props.searchParams);

  const searchFields = ["title"];

  await queryClient.prefetchQuery(
    orpcTQClient.job.bin.list.queryOptions({
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
        title="Recycle bin"
        shortDescription="jobs recycle bin management"
      >
        <JobBinManagementTable
          page={filters.page}
          limit={filters.limit}
          search={filters.search}
          searchFields={searchFields}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
