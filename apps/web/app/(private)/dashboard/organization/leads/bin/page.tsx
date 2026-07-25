import { Metadata } from "next";

import { parseAsArrayOf, parseAsIsoDate } from "nuqs/server";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { LeadBinManagementTable } from "@/features/lead/components/lead-bin-table/LeadBinManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Lead Recycle Bin",
};

export default async function LeadBinPage(
  props: PageProps<"/dashboard/organization/leads/bin">
) {
  await requireUserPermissionsWithOrgCache([
    "org.lead.manage",
    "org.lead.delete",
  ]);

  const queryClient = getQueryClient();

  const filters = await tableQuerySearchParams({
    deletedAt: parseAsArrayOf(parseAsIsoDate, ",").withOptions({
      clearOnDefault: true,
    }),
  })(props.searchParams);

  const searchFields = ["name", "email", "phone"];

  await queryClient.prefetchQuery(
    orpcTQClient.lead.bin.list.queryOptions({
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
        shortDescription="leads recycle bin management"
      >
        <LeadBinManagementTable
          page={filters.page}
          limit={filters.limit}
          search={filters.search}
          searchFields={searchFields}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
