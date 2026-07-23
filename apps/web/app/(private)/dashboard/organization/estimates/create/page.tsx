import { Metadata } from "next";
import { redirect } from "next/navigation";

import { and, eq, isNull } from "drizzle-orm";
import { createLoader, parseAsString } from "nuqs/server";

import { JobTable, LeadTable } from "@workspace/drizzle/schemas";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

import { DashboardShell } from "@/components/shared/DashboardShell";

import { DEFAULT_AUTH_PATH } from "@/constants";
import { getAuthUserWithRolesAndPermissionsWithOrgCache } from "@/features/auth/data/getAuthUser";
import { LeadEstimateCreateForm } from "@/features/lead/components/lead-estimate/LeadEstimateCreateForm";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Create Estimate",
};

export default async function EstimateCreatePage(
  props: PageProps<"/dashboard/organization/estimates/create">
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

  const { session } = await getAuthUserWithRolesAndPermissionsWithOrgCache();

  await requireUserPermissionsWithOrgCache(
    leadId
      ? ["org.lead_estimate.manage", "org.lead_estimate.create"]
      : jobId
        ? ["org.job_estimate.manage", "org.job_estimate.create"]
        : [
            "org.lead_estimate.manage",
            "org.lead_estimate.create",
            "org.job_estimate.manage",
            "org.job_estimate.create",
          ]
  );

  if (leadId) {
    const [existlead] = await db
      .select({ id: LeadTable.id })
      .from(LeadTable)
      .where(
        and(
          eq(LeadTable.orgId, session.activeOrganizationId!),
          eq(LeadTable.id, leadId),
          isNull(LeadTable.deletedAt)
        )
      );
    if (!existlead) {
      throw redirect(DEFAULT_AUTH_PATH);
    }
  }
  if (jobId) {
    const [existJob] = await db
      .select({ id: JobTable.id })
      .from(JobTable)
      .where(
        and(
          eq(JobTable.orgId, session.activeOrganizationId!),
          eq(JobTable.id, jobId),
          isNull(JobTable.deletedAt)
        )
      );
    if (!existJob) {
      throw redirect(DEFAULT_AUTH_PATH);
    }
  }

  return (
    <DashboardShell
      title="Create Estimate"
      backUrl={redirectUrl.toString()}
      className="max-w-4xl w-full mx-auto"
    >
      <LeadEstimateCreateForm
        leadId={leadId}
        jobId={jobId}
        redirectTo={redirectUrl.toString()}
      />
    </DashboardShell>
  );
}
