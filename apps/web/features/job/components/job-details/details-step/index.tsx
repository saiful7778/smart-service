"use client";

import { useQuery } from "@tanstack/react-query";

import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { AddressDetails } from "@/features/lead/components/lead-details/details-step/AddressDetails";
import { LeadRevenueStats } from "@/features/lead/components/lead-details/details-step/LeadRevenueStats";
import { TimeCard } from "@/features/lead/components/lead-details/details-step/TimeCard";
import { LeadNotes } from "@/features/lead/components/lead-note";
import { orpcTQClient } from "@/server/orpc.client";

import { JobGeneralInfo } from "./JobGeneralInfo";

export function DetailsStep({ jobId }: { jobId: string }) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.job.details.queryOptions({
      input: {
        jobId,
      },
    })
  );

  return (
    <QueryStateBoundary
      data={data?.data}
      isLoading={isLoading}
      error={error}
      isError={isError}
      isEmpty={() => false}
      loadingFallback={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-96 w-full rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      }
    >
      {(data) => {
        const isCompletedOrCancelled =
          data.status === "completed" || data.status === "cancelled";

        const missedRevenue = isCompletedOrCancelled
          ? Number(data.invoicedRevenue || 0) -
            Number(data.receivedRevenue || 0)
          : 0;

        return (
          <div className="space-y-4 md:space-y-6 lg:space-y-10 animate-in fade-in duration-500">
            <LeadRevenueStats
              leadId={data.leadId}
              jobId={data.id}
              totalExpectedRevenue={data.expectedRevenue}
              totalInvoicedRevenue={data.invoicedRevenue}
              totalMissedRevenue={missedRevenue.toString()}
              totalReceivedRevenue={data.receivedRevenue}
            />

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-8">
                <JobGeneralInfo
                  leadId={data.leadId}
                  jobId={data.id}
                  status={data.status}
                  title={data.title}
                  description={data.description}
                  createdBy={data.createdByMember}
                />
                <LeadNotes leadId={data.leadId} jobId={data.id} />
              </div>

              <div className="lg:col-span-4 space-y-8">
                <TimeCard
                  createdAt={data.createdAt}
                  schedules={data.schedules}
                />
                <AddressDetails
                  leadId={data.leadId}
                  jobId={data.id}
                  addresses={data.addresses}
                />
              </div>
            </div>
          </div>
        );
      }}
    </QueryStateBoundary>
  );
}
