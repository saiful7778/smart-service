import { Metadata } from "next";

import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import { LeadStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";

import { createRangeFilterServer } from "@/lib/nuqs/rangeFilter.server";
import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

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
    ...createRangeFilterServer(),
    status: parseAsStringLiteral(LeadStatusEnumSchema.options).withOptions({
      clearOnDefault: true,
    }),
    categories: parseAsArrayOf(parseAsString, ",").withOptions({
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
          createdAt:
            filters.startTime && filters.endTime
              ? { from: filters.startTime, to: filters.endTime }
              : undefined,
        },
      },
    })
  );

  await queryClient.prefetchQuery(
    orpcTQClient.lead.category.listForSearch.queryOptions()
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <DashboardShellHeader>
            <DashboardShellTitle>All Leads</DashboardShellTitle>
            <DashboardShellDescription>
              Manage all leads in your organization.
            </DashboardShellDescription>
          </DashboardShellHeader>
        }
      >
        <LeadManagementTable searchFields={searchFields} />
      </DashboardShell>
    </HydrateClient>
  );
}
