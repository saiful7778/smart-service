"use client";

import { useQuery } from "@tanstack/react-query";

import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { orpcTQClient } from "@/server/orpc.client";

import { LeadNotes } from "../../lead-note";
import { AddressDetails } from "./AddressDetails";
import { GeneralInfo } from "./GeneralInfo";
import { LeadRevenueStats } from "./LeadRevenueStats";
import { TimeCard } from "./TimeCard";

export function DetailsStep({ leadId }: { leadId: string }) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.lead.details.queryOptions({
      input: {
        leadId,
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
      {(data) => (
        <div className="space-y-4 md:space-y-6 lg:space-y-10 animate-in fade-in duration-500">
          <LeadRevenueStats
            leadId={data.id}
            jobId={undefined}
            totalExpectedRevenue={data.totalExpectedRevenue}
            totalInvoicedRevenue={data.totalInvoicedRevenue}
            totalMissedRevenue={data.totalMissedRevenue}
            totalReceivedRevenue={data.totalReceivedRevenue}
          />

          <Separator />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <GeneralInfo
                leadId={data.id}
                status={data.status}
                serviceType={data.serviceType}
                source={data.source}
                leadCategories={data.leadCategories}
                description={data.description}
              />
              <LeadNotes leadId={data.id} jobId={undefined} />
            </div>

            <div className="lg:col-span-4 space-y-8">
              <TimeCard
                createdAt={data.createdAt}
              />
              <AddressDetails
                leadId={data.id}
                jobId={undefined}
                addresses={data.addresses}
              />
            </div>
          </div>
        </div>
      )}
    </QueryStateBoundary>
  );
}
