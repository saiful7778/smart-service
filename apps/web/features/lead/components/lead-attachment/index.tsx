"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleQuestionMark } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { hasPermissionWithOrg } from "@/lib/permission";
import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { orpcTQClient } from "@/server/orpc.client";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";
import { useOrgStore } from "@/stores/zustand/org/OrgStoreContext";

import { LeadAttachmentItem } from "./LeadAttachmentItem";
import { LeadAttachmentUploadDialog } from "./LeadAttachmentUpload";

export function LeadAttachment({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  const permissions = useAuthStore((state) => state.permissions);
  const activeOrg = useOrgStore((state) => state.activeOrg!);

  const { data, isLoading, isError } = useQuery(
    orpcTQClient.lead.attachment.list.queryOptions({
      input: {
        leadId,
        jobId,
      },
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Attachments</h3>
          <p className="text-xs text-muted-foreground">
            Manage attachments for this lead
          </p>
        </div>
        {hasPermissionWithOrg(
          permissions,
          ["org.lead.manage", "org.lead.update"],
          {
            orgId: activeOrg.id,
          }
        ) && <LeadAttachmentUploadDialog leadId={leadId} jobId={jobId} />}
      </div>

      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        data={data?.data}
        isEmpty={(d) => d.length === 0}
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
              <EmptyTitle>No attachments found</EmptyTitle>
              <EmptyDescription>
                There are currently no attachments found for this lead.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        {(data) => (
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
            {data.map((attachment) => (
              <LeadAttachmentItem key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}
      </QueryStateBoundary>
    </div>
  );
}
