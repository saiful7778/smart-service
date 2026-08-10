import { Metadata } from "next";

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsIsoDate,
  parseAsStringEnum,
} from "nuqs/server";

import { JobStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";

import { createRangeFilterServer } from "@/lib/nuqs/rangeFilter.server";
import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { JobManagementTable } from "@/features/job/components/job-table/JobManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Jobs",
};

export default async function JobsPage(
  props: PageProps<"/dashboard/organization/jobs">
) {
  await requireUserPermissionsWithOrgCache(["org.job.manage", "org.job.list"]);

  const queryClient = getQueryClient();

  const filters = await tableQuerySearchParams({
    ...createRangeFilterServer(),
    status: parseAsStringEnum(JobStatusEnumSchema.options).withOptions({
      clearOnDefault: true,
    }),
    bookedAt: parseAsArrayOf(parseAsIsoDate, ",").withOptions({
      clearOnDefault: true,
    }),
    serviceAt: parseAsArrayOf(parseAsIsoDate, ",").withOptions({
      clearOnDefault: true,
    }),
    revenue: parseAsArrayOf(parseAsInteger, ",").withOptions({
      clearOnDefault: true,
    }),
  })(props.searchParams);

  const searchFields = ["title"];

  await queryClient.prefetchQuery(
    orpcTQClient.job.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          status: filters.status ?? undefined,
          bookedAt: filters.bookedAt
            ? { from: filters.bookedAt[0], to: filters.bookedAt[1] }
            : undefined,
          serviceAt: filters.serviceAt
            ? { from: filters.serviceAt[0], to: filters.serviceAt[1] }
            : undefined,
          receivedRevenue: filters.revenue
            ? { from: filters.revenue[0], to: filters.revenue[1] }
            : undefined,
          // createdAt:
          //   filters.startTime && filters.endTime
          //     ? { from: filters.startTime, to: filters.endTime }
          //     : undefined,
        },
      },
    })
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <div>
            <DashboardShellTitle>Jobs</DashboardShellTitle>
            <DashboardShellDescription>
              Track and manage your service jobs
            </DashboardShellDescription>
          </div>
        }
      >
        <JobManagementTable
          limit={filters.limit}
          page={filters.page}
          search={filters.search}
          searchFields={searchFields}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
