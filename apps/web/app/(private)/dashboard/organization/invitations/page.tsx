import { parseAsStringLiteral } from "nuqs/server";

import { OrgRoleEnumSchema } from "@workspace/lib/utils";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

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
        title="Invitations"
        shortDescription="Manage the invitations to your organization."
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
