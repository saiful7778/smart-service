import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { ScheduleCalendarManagement } from "@/features/job/components/ScheduleCalendarManagement";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export default async function SchedulePage() {
  await requireUserPermissionsWithOrgCache([
    "org.schedule.manage",
    "org.schedule.read",
  ]);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpcTQClient.job.listSchedule.queryOptions());

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <div>
            <DashboardShellTitle>Schedule Calendar</DashboardShellTitle>
            <DashboardShellDescription>
              Manage your organization&lsquo;s events and features.
            </DashboardShellDescription>
          </div>
        }
      >
        <ScheduleCalendarManagement />
      </DashboardShell>
    </HydrateClient>
  );
}
