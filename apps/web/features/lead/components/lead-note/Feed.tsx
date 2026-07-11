"use client";

import { Fragment, useCallback, useMemo, useState } from "react";

import { formatDate, isToday, isYesterday } from "date-fns";
import toast from "react-hot-toast";

import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";

import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

import { useLeadNoteDelete } from "../../api/lead.api.hook";
import { ListLeadNotesOutputs } from "../../api/leadNote.contract";
import { LeadNoteUpdateDialog } from "./LeadNoteUpdateDialog";
import { LeadNoteSkeleton } from "./LoadingSkeleton";
import { LeadNoteItem } from "./NoteItem";

interface FeedProps {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
  notes: ListLeadNotesOutputs["data"];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export function Feed({
  leadId,
  jobId,
  notes,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: FeedProps) {
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [noteToAction, setNoteToAction] = useState<
    ListLeadNotesOutputs["data"][number] | null
  >(null);

  const { ref } = useIntersectionObserver<HTMLDivElement>({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const handleDeleteDialog = useCallback(
    (leadNoteId: string) => {
      const noteData = notes.find((note) => note.id === leadNoteId);
      if (noteData) {
        setNoteToAction(noteData);
        setOpenDeleteDialog(true);
      }
    },
    [notes]
  );

  const { mutate: deleteNote, isPending: deletePending } = useLeadNoteDelete({
    onSuccess: () => {
      setOpenDeleteDialog(false);
      setNoteToAction(null);
    },
  });

  const handleDelete = useCallback(() => {
    if (noteToAction) {
      deleteNote({
        leadId,
        leadNoteId: noteToAction.id,
        ...(jobId && { jobId }),
      });
    }
  }, [leadId, jobId, deleteNote, noteToAction]);

  const handleUpdateDialog = useCallback(
    (leadNoteId: string) => {
      const noteData = notes.find((note) => note.id === leadNoteId);
      if (!noteData) {
        toast.error("Note is not found");
        return;
      }
      setNoteToAction(noteData);
      setOpenUpdateDialog(true);
    },
    [notes]
  );

  const groupedNotes = useMemo(() => {
    const groups = new Map<string, ListLeadNotesOutputs["data"]>();

    notes.forEach((note) => {
      const date = new Date(note.createdAt);
      let label = "";

      if (isToday(date)) {
        label = "Today";
      } else if (isYesterday(date)) {
        label = "Yesterday";
      } else {
        label = formatDate(date, "PP");
      }

      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)?.push(note);
    });

    return Array.from(groups.entries());
  }, [notes]);

  return (
    <div className="space-y-4 mt-6">
      {groupedNotes.map(([dateString, dateNotes]) => (
        <Fragment key={dateString}>
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
            <span className="text-xs tracking-[0.2em] text-muted-foreground whitespace-nowrap px-3">
              {dateString}
            </span>
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
          </div>
          <div className="space-y-4">
            {dateNotes.map((note) => (
              <LeadNoteItem
                key={note.id}
                note={note}
                handleDeleteDialog={handleDeleteDialog}
                handleUpdateDialog={handleUpdateDialog}
              />
            ))}
          </div>
        </Fragment>
      ))}

      <div ref={ref} className="h-4">
        {isFetchingNextPage && <LeadNoteSkeleton />}
      </div>

      <LeadNoteUpdateDialog
        open={openUpdateDialog}
        onOpenChange={setOpenUpdateDialog}
        leadNoteId={noteToAction ? noteToAction.id : undefined}
        initialData={
          noteToAction
            ? {
                leadId: noteToAction.leadId,
                jobId: noteToAction.job?.id,
                content: noteToAction.content,
              }
            : undefined
        }
      />
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDelete}
        isLoading={deletePending}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
      />
    </div>
  );
}
