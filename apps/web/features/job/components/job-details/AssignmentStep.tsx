"use client";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { CircleQuestionMark } from "lucide-react";
import { parseAsIndex, useQueryState } from "nuqs";

import { JobAssignmentStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Status,
  StatusIndicator,
  StatusLabel,
  StatusVariant,
} from "@workspace/ui/components/status";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { MetaPagination } from "@/components/MetaPagination";
import { UserAvatar } from "@/components/UserAvatar";

import { DEFAULT_PAGE_INDEX } from "@/constants";
import { orpcTQClient } from "@/server/orpc.client";

import { ListJobAssignmentContractType } from "../../api/jobAssignment.contract";

export function AssignmentStep({ jobId }: { jobId: string }) {
  const [page, setPage] = useQueryState(
    "page",
    parseAsIndex
      .withDefault(DEFAULT_PAGE_INDEX)
      .withOptions({ history: "push", shallow: true })
  );

  const { data, isLoading, isError } = useQuery(
    orpcTQClient.job.assignment.list.queryOptions({
      input: {
        jobId,
        page,
      },
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Assignments</h3>
          <p className="text-xs text-muted-foreground">
            Manage job assignments
          </p>
        </div>
      </div>

      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        data={data?.data}
        isEmpty={(d) => d.data.length === 0}
        loadingFallback={
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(400px,1fr))]">
            {Array.from({ length: 6 }, (_, idx) => (
              <Skeleton key={idx} className="h-24 rounded-xl" />
            ))}
          </div>
        }
        emptyFallback={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleQuestionMark className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No assignments found</EmptyTitle>
              <EmptyDescription>
                There are currently no assignments found.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        {({ data, meta }) => (
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
              {data.map((assignment) => (
                <JobAssignmentItem
                  key={assignment.id}
                  assignment={assignment}
                />
              ))}
            </div>
            <MetaPagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </QueryStateBoundary>
    </div>
  );
}

const statusVariant: Record<JobAssignmentStatusEnumType, StatusVariant> = {
  pending: "warning",
  cancelled: "error",
  completed: "success",
  declined: "error",
  active: "info",
};

function JobAssignmentItem({
  assignment,
}: {
  assignment: ListJobAssignmentContractType["output"]["data"]["data"][number];
}) {
  return (
    <div className="bg-card border rounded-md p-4 shadow-md space-y-4">
      <div className="flex items-start gap-2 justify-between">
        <div>
          <h6 className="text-base">{assignment.schedule.title}</h6>
          <div className="mt-2">
            <div className="flex gap-1 items-center leading-tight">
              <span className="font-medium text-muted-foreground">
                Start at
              </span>
              <span className="font-medium text-muted-foreground">:</span>
              <span>{formatDate(assignment.schedule.startAt, "PP - p")}</span>
            </div>
            <div className="flex gap-1 items-center leading-tight">
              <span className="font-medium text-muted-foreground">End at</span>
              <span className="font-medium text-muted-foreground">:</span>
              <span>{formatDate(assignment.schedule.endAt, "PP - p")}</span>
            </div>
          </div>
        </div>
        <Badge
          variant={assignment.role === "primary" ? "default" : "secondary"}
        >
          {formatEnumValue(assignment.role)}
        </Badge>
      </div>
      <Separator />
      <div className="flex items-center justify-between gap-2">
        <UserAvatar
          userName={assignment.assignedToMember.name}
          userEmail={assignment.assignedToMember.email}
          imageUrl={assignment.assignedToMember.image}
          userRoles={assignment.assignedToMember.roles}
          showDetails
          showRoleDetails
        />
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Status variant={statusVariant[assignment.status]}>
            <StatusIndicator />
            <StatusLabel>{formatEnumValue(assignment.status)}</StatusLabel>
          </Status>
          {assignment.acknowledgeAt && (
            <span className="text-xs text-muted-foreground">
              {formatDate(assignment.acknowledgeAt, "PP - p")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
