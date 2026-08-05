import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import { NotebookTabs } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import {
  DEFAULT_INFINITE_PAGE_SIZE,
  DEFAULT_INFINITE_PAGE_START,
} from "@/constants";
import { orpcTQClient } from "@/server/orpc.client";

import { useLeadNoteCreate } from "../../api/lead.api.hook";
import { leadNoteSchema, LeadNoteType } from "../../lead.schema";
import { LeadNoteForm } from "../forms/LeadNoteForm";
import { Feed } from "./Feed";
import { LeadNotesSkeleton } from "./LoadingSkeleton";

export function LeadNotes({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    orpcTQClient.lead.note.list.infiniteOptions({
      input: (pageParam) => ({
        leadId,
        jobId,
        order: "desc",
        orderField: "createdAt",
        page: pageParam,
        limit: DEFAULT_INFINITE_PAGE_SIZE,
      }),
      getNextPageParam: ({ data }) => data.meta.nextPage ?? undefined,
      initialPageParam: DEFAULT_INFINITE_PAGE_START,
    })
  );

  const form = useForm<LeadNoteType>({
    resolver: zodResolver(leadNoteSchema),
    defaultValues: {
      leadId,
      jobId,
      content: "",
    },
  });

  const { mutate, isPending } = useLeadNoteCreate<keyof LeadNoteType>({
    onSuccess: () => {
      form.reset();
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <NotebookTabs className="size-4 text-primary" />
        <h3 className="font-semibold text-lg">Lead Notes</h3>
      </div>
      <Separator />
      <LeadNoteForm
        formId="lead_note_update_form"
        form={form}
        onSubmit={mutate}
        isSubmitting={isPending}
      />

      <QueryStateBoundary
        data={data}
        isLoading={isLoading}
        error={error}
        isError={isError}
        isEmpty={(d) =>
          !d ||
          d.pages.length === 0 ||
          (d.pages[0]?.data.data.length ?? 0) === 0
        }
        loadingFallback={<LeadNotesSkeleton />}
        emptyFallback={<LeadNotesEmpty />}
      >
        {({ pages }) => (
          <Feed
            leadId={leadId}
            jobId={jobId}
            notes={pages.flatMap((page) => page.data.data)}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}

function LeadNotesEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <NotebookTabs className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No notes found</EmptyTitle>
        <EmptyDescription>
          Get started by adding your first note.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
