import { parseAsStringLiteral } from "nuqs/server";

import { OrgRoleEnumSchema } from "@workspace/lib/utils";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { InvitationManagementTable } from "@/features/org/components/invitation-table/InvitationManagementTable";
import { invitationStatusEnum } from "@/features/org/org.schema";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export default async function MemberPage(
  props: PageProps<"/dashboard/organization/invitations">
) {
  await requireUserPermissionsWithOrgCache([
    "org.invitation.manage",
    "org.invitation.list",
  ]);

  const queryClient = getQueryClient();

  const filters = await tableQuerySearchParams({
    status: parseAsStringLiteral(invitationStatusEnum.options).withOptions({
      clearOnDefault: true,
    }),
    role: parseAsStringLiteral(OrgRoleEnumSchema.options).withOptions({
      clearOnDefault: true,
    }),
  })(props.searchParams);

  const searchFields = ["email"];

  await queryClient.prefetchQuery(
    orpcTQClient.org.listInvitation.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          status: filters.status ?? undefined,
          role: filters.role ?? undefined,
        },
      },
    })
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <div>
            <DashboardShellTitle>Invitations</DashboardShellTitle>
            <DashboardShellDescription>
              Manage the invitations to your organization.
            </DashboardShellDescription>
          </div>
        }
      >
        <InvitationManagementTable
          page={filters.page}
          limit={filters.limit}
          search={filters.search}
          searchFields={searchFields}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
