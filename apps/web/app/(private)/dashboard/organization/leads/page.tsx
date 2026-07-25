import { Metadata } from "next";

import {
  parseAsArrayOf,
  parseAsIsoDate,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import { LeadStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { LeadManagementTable } from "@/features/lead/components/lead-table/LeadManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Leads",
};

export default async function LeadPage(
  props: PageProps<"/dashboard/organization/leads">
) {
  await requireUserPermissionsWithOrgCache([
    "org.lead.manage",
    "org.lead.list",
  ]);

  const queryClient = getQueryClient();

  const filters = await tableQuerySearchParams({
    status: parseAsStringLiteral(LeadStatusEnumSchema.options).withOptions({
      clearOnDefault: true,
    }),
    categories: parseAsArrayOf(parseAsString, ",").withOptions({
      clearOnDefault: true,
    }),
    createdAt: parseAsArrayOf(parseAsIsoDate, ",").withOptions({
      clearOnDefault: true,
    }),
  })(props.searchParams);

  const searchFields = ["name", "email", "phone"];

  await queryClient.prefetchQuery(
    orpcTQClient.lead.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        searchFields,
        filter: {
          status: filters.status ?? undefined,
          categories: filters.categories ?? undefined,
          createdAt: filters.createdAt
            ? { from: filters.createdAt[0], to: filters.createdAt[1] }
            : undefined,
        },
      },
    })
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        title="All Leads"
        shortDescription="Manage all leads in your organization."
      >
        <LeadManagementTable
          page={filters.page}
          limit={filters.limit}
          search={filters.search}
          searchFields={searchFields}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
