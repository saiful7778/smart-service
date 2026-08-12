import { Metadata } from "next";

import { ArrowLeft } from "lucide-react";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { DashboardShellHeader } from "@/components/shared/dashboard-shell/DashboardShellHeader";

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

  await queryclient.prefetchQuery(
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
        header={
          <DashboardShellHeader>
            <LinkButton href="/dashboard/organization/materials">
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
          </DashboardShellHeader>
        }
      >
        <MaterialDetails materialId={materialId} />
      </DashboardShell>
    </HydrateClient>
  );
}
