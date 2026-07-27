import { Metadata } from "next";
import { redirect } from "next/navigation";

import { createLoader, parseAsString } from "nuqs/server";

import { env } from "@/lib/env";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { DEFAULT_AUTH_PATH } from "@/constants";
import { LeadEstimateUpdateForm } from "@/features/lead/components/lead-estimate/LeadEstimateUpdateForm";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Update Estimate",
};

export default async function EstimateUpdatePage(
  props: PageProps<"/dashboard/organization/estimates/[estimateId]/update">
) {
  const { leadId, jobId, redirectTo } = await createLoader({
    leadId: parseAsString.withOptions({ clearOnDefault: true }),
    jobId: parseAsString.withOptions({ clearOnDefault: true }),
    redirectTo: parseAsString.withOptions({ clearOnDefault: true }),
  })(props.searchParams);

  if (!leadId && !jobId) {
    throw redirect(DEFAULT_AUTH_PATH);
  }

  const redirectUrl = new URL(
    redirectTo || DEFAULT_AUTH_PATH,
    env.NEXT_PUBLIC_SITE_URL
  );

  await requireUserPermissionsWithOrgCache(
    leadId
      ? ["org.lead_estimate.manage", "org.lead_estimate.update"]
      : jobId
        ? ["org.job_estimate.manage", "org.job_estimate.update"]
        : [
            "org.lead_estimate.manage",
            "org.lead_estimate.update",
            "org.job_estimate.manage",
            "org.job_estimate.update",
          ]
  );

  const { estimateId } = await props.params;

  const queryclient = getQueryClient();

  const { data } = await queryclient.fetchQuery(
    orpcTQClient.lead.estimate.details.queryOptions({
      input: {
        leadId,
        jobId,
        estimateId,
      },
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        className="max-w-5xl mx-auto w-full"
        backUrl={redirectUrl.toString()}
        title={data.name}
        shortDescription="Update estimate information."
      >
        <LeadEstimateUpdateForm
          estimateId={estimateId}
          leadId={leadId}
          jobId={jobId}
          redirectTo={redirectUrl.toString()}
          initialData={{
            name: data.name,
            description: data?.description || "",
            status: data.status,
            discountRate: data?.discountRate || "",
            taxRate: data?.taxRate || "",
            validUntil: data?.validUntil || undefined,
            notes: data?.notes || "",
            terms: data?.terms || "",
            materials: data.materials.map(
              ({ material, quantity, totalPrice, notes }) => ({
                materialId: material.id,
                unitPrice: material.unitPrice,
                quantity,
                totalPrice,
                notes: notes || "",
              })
            ),
          }}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
