import { Metadata } from "next";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { MaterialDetails } from "@/features/material/components/MaterialDetails";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Material Details",
};

export default async function MaterialDetailsPage(
  props: PageProps<"/dashboard/organization/materials/[materialId]">
) {
  await requireUserPermissionsWithOrgCache([
    "org.material.manage",
    "org.material.read",
  ]);

  const { materialId } = await props.params;

  const queryclient = getQueryClient();

  const { data } = await queryclient.fetchQuery(
    orpcTQClient.material.details.queryOptions({
      input: {
        materialId,
      },
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        className="max-w-4xl mx-auto w-full"
        backUrl="/dashboard/organization/materials"
        title={data.name}
        shortDescription="Detailed overview of material."
      >
        <MaterialDetails materialId={data.id} />
      </DashboardShell>
    </HydrateClient>
  );
}
