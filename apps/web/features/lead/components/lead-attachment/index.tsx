"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleQuestionMark, Table, Trash2 } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/server/orpc.client";

import { LeadAttachmentContextProvider } from "./LeadAttachmentContext";
import {
  LeadAttachmentBinItem,
  LeadAttachmentItem,
} from "./LeadAttachmentItem";
import { LeadAttachmentUploadDialog } from "./LeadAttachmentUpload";

export function LeadAttachment({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  const isAllowUpload = usePermissionCheckWithOrg([
    "org.lead_attachment.manage",
    "org.lead_attachment.update",
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Attachments</h3>
          <p className="text-xs text-muted-foreground">Manage attachments</p>
        </div>
        {isAllowUpload && (
          <LeadAttachmentUploadDialog leadId={leadId} jobId={jobId} />
        )}
      </div>

      <TabNavigation paramName="attachment-state" defaultValue="all">
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
            <FirstStep leadId={leadId} jobId={jobId} />
          </TabNavigationContent>
          <TabNavigationContent value="bin">
            <SecondStep leadId={leadId} jobId={jobId} />
          </TabNavigationContent>
        </div>
      </TabNavigation>
    </div>
  );
}

function FirstStep({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  const { data, isLoading, isError } = useQuery(
    orpcTQClient.lead.attachment.list.queryOptions({
      input: {
        leadId,
        jobId,
      },
    })
  );

  return (
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
              There are currently no attachments found.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    >
      {(data) => (
        <LeadAttachmentContextProvider
          attachments={data}
          jobId={jobId}
          leadId={leadId}
        >
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
            {data.map((attachment) => (
              <LeadAttachmentItem key={attachment.id} attachment={attachment} />
            ))}
          </div>
        </LeadAttachmentContextProvider>
      )}
    </QueryStateBoundary>
  );
}

function SecondStep({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  const { data, isLoading, isError } = useQuery(
    orpcTQClient.lead.attachment.bin.list.queryOptions({
      input: {
        leadId,
        jobId,
      },
    })
  );
  return (
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
              <Trash2 className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Bin is empty</EmptyTitle>
          </EmptyHeader>
        </Empty>
      }
    >
      {(data) => (
        <LeadAttachmentContextProvider
          attachments={data}
          jobId={jobId}
          leadId={leadId}
        >
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
            {data.map((attachment) => (
              <LeadAttachmentBinItem
                key={attachment.id}
                attachment={attachment}
              />
            ))}
          </div>
        </LeadAttachmentContextProvider>
      )}
    </QueryStateBoundary>
  );
}
