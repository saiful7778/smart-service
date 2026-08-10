"use client";

import Link from "next/link";

import { PlusCircle, Table, Trash2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

import { LeadEstimateBinManagementTable } from "../lead-estimate-bin-table/LeadEstimateBinManagementTable";
import { LeadEstimateManagementTable } from "../lead-estimate-table/LeadEstimateManagementTable";

export function LeadEstimate({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  const isAllowCreate = usePermissionCheckWithOrg(
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Estimates</h3>
          <p className="text-xs text-muted-foreground">Manage estimates</p>
        </div>

        {isAllowCreate && (
          <Button
            nativeButton={false}
            render={
              <Link
                href={{
                  pathname: "/dashboard/organization/estimates/create",
                  query: leadId
                    ? {
                        leadId,
                        redirectTo: `/dashboard/organization/leads/${leadId}?tab=estimates`,
                      }
                    : jobId
                      ? {
                          jobId,
                          redirectTo: `/dashboard/organization/jobs/${jobId}?tab=estimates`,
                        }
                      : undefined,
                }}
              />
            }
          >
            <PlusCircle />
            <span>Create Estimate</span>
          </Button>
        )}
      </div>

      <TabNavigation paramName="estimate-state" defaultValue="all">
        <TabNavigationList>
          <TabNavigationTrigger value="all">
            <Table className="size-4" />
            <span>All</span>
          </TabNavigationTrigger>
          <TabNavigationTrigger value="bin">
            <Trash2 className="size-4" />
            <span>Bin</span>
          </TabNavigationTrigger>
        </TabNavigationList>

        <div>
          <TabNavigationContent value="all">
            <LeadEstimateManagementTable leadId={leadId} jobId={jobId} />
          </TabNavigationContent>
          <TabNavigationContent value="bin">
            <LeadEstimateBinManagementTable leadId={leadId} jobId={jobId} />
          </TabNavigationContent>
        </div>
      </TabNavigation>
    </div>
  );
}
