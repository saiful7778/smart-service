"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { Briefcase, Plus } from "lucide-react";
import { parseAsIndex, useQueryState } from "nuqs";

import { JobStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatCurrency } from "@workspace/lib/utils";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { RefreshButton } from "@workspace/ui/components/refresh-button";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Status,
  StatusIndicator,
  StatusLabel,
  StatusVariant,
} from "@workspace/ui/components/status";
import { cn } from "@workspace/ui/lib/utils";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { MetaPagination } from "@/components/MetaPagination";
import { UserAvatarImage } from "@/components/UserAvatar";

import { DEFAULT_PAGE_INDEX } from "@/constants";
import { ListLeadJobsContractType } from "@/features/lead/api/leadJob.contract";
import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/server/orpc.client";
import { RoutePathType } from "@/types";
import { nameInitials } from "@/utils/nameInitials";

export function JobStep({ leadId }: { leadId: string }) {
  const isAllowJobCreate = usePermissionCheckWithOrg([
    "org.job.manage",
    "org.job.create",
  ]);

  const [page, setPage] = useQueryState(
    "page",
    parseAsIndex
      .withDefault(DEFAULT_PAGE_INDEX)
      .withOptions({ history: "push", shallow: true })
  );

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.lead.job.list.queryOptions({
      input: {
        leadId,
        page,
        limit: 5,
        order: "desc",
        orderField: "createdAt",
      },
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Jobs</h3>
          <p className="text-xs text-muted-foreground">
            Manage jobs for this lead
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton
            isLoading={isLoading}
            onButtonClick={() => refetch()}
          />
          {isAllowJobCreate && (
            <Button
              nativeButton={false}
              render={
                <Link
                  href={{
                    pathname: "/dashboard/organization/jobs/create",
                    search: `leadId=${leadId}`,
                  }}
                />
              }
            >
              <Plus />
              <span>Create Job</span>
            </Button>
          )}
        </div>
      </div>

      <QueryStateBoundary
        data={data?.data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={(d) => d.data.length === 0}
        loadingFallback={<JobsSkeleton />}
        emptyFallback={
          <Empty className="py-12 border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Briefcase className="size-8" />
              </EmptyMedia>
              <EmptyTitle>No jobs yet</EmptyTitle>
              <EmptyDescription>
                This lead hasn&apos;t been converted into any jobs yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        {({ data, meta }) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.map((job) => (
                <JobItem key={job.id} job={job} />
              ))}
            </div>
            <MetaPagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </QueryStateBoundary>
    </div>
  );
}

const statusConfig: Record<
  JobStatusEnumType,
  { variant: StatusVariant; label: string }
> = {
  draft: { variant: "default", label: "Draft" },
  scheduled: { variant: "info", label: "Scheduled" },
  in_progress: { variant: "info", label: "In Progress" },
  on_hold: { variant: "warning", label: "On Hold" },
  needs_review: { variant: "warning", label: "Needs Review" },
  completed: { variant: "success", label: "Completed" },
  cancelled: { variant: "error", label: "Cancelled" },
} as const;

interface JobItemProps {
  job: ListLeadJobsContractType["output"]["data"]["data"][number];
}

function JobItem({ job }: JobItemProps) {
  const config = statusConfig[job.status] || {
    variant: "default",
    label: job.status,
  };

  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <Link
                  href={
                    `/dashboard/organization/jobs/${job.id}` as RoutePathType
                  }
                  className="font-bold text-base text-foreground/90 hover:underline"
                >
                  {job.title}
                </Link>
                <Status variant={config.variant} className="h-6">
                  <StatusIndicator />
                  <StatusLabel className="text-[10px] uppercase tracking-wider font-bold">
                    {config.label}
                  </StatusLabel>
                </Status>
              </div>
              {job.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-lg w-full mt-1">
                  {job.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex flex-wrap items-center gap-4">
              <RevenueStat
                label="Expected"
                amount={job.expectedRevenue}
                color="text-amber-600 dark:text-amber-400"
                bg="bg-amber-50 dark:bg-amber-950"
              />
              <RevenueStat
                label="Invoiced"
                amount={job.invoicedRevenue}
                color="text-blue-600 dark:text-blue-400"
                bg="bg-blue-50 dark:bg-blue-950"
              />
              <RevenueStat
                label="Received"
                amount={job.receivedRevenue}
                color="text-emerald-600 dark:text-emerald-400"
                bg="bg-emerald-50 dark:bg-emerald-950"
              />
            </div>

            <div className="flex items-center justify-start sm:justify-end gap-2.5">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                  Created By
                </p>
                <p className="text-xs font-semibold text-foreground/80">
                  {job.createdBy.name}
                </p>
              </div>
              <Avatar className="size-8">
                <UserAvatarImage
                  image={job.createdBy.image}
                  alt={job.createdBy.name}
                />
                <AvatarFallback>
                  {nameInitials(job.createdBy.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueStat({
  label,
  amount,
  color,
  bg,
}: {
  label: string;
  amount: string | number | null;
  color: string;
  bg: string;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </span>
      <div
        className={cn(
          "flex items-center gap-1 font-bold text-sm w-fit px-2 py-0.5 rounded-md border border-current/10",
          color,
          bg
        )}
      >
        {formatCurrency(Number(amount ?? 0))}
      </div>
    </div>
  );
}

function JobsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <Card key={i} className="w-full">
          <CardContent className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-12 w-32 rounded-lg" />
              </div>
              <div className="flex justify-between items-end mt-5">
                <div className="flex gap-6">
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="space-y-1 items-end flex flex-col">
                    <Skeleton className="h-2 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="size-8 rounded-full" />
                </div>
              </div>
            </div>
            <Separator orientation="vertical" />
            <div className="flex flex-col gap-2">
              <Skeleton className="size-8 rounded-sm" />
              <Skeleton className="size-8 rounded-sm" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
