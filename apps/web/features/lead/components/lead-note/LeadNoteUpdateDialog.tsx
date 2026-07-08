import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

import { useLeadNoteUpdate } from "../../api/lead.api.hook";
import { leadNoteSchema, LeadNoteType } from "../../lead.schema";
import { LeadNoteForm } from "../forms/LeadNoteForm";

interface LeadNoteUpdateDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  initialData?:
    | {
        leadId: string;
        leadNoteId: string;
        content: string;
        jobId?: string;
      }
    | undefined;
}

export function LeadNoteUpdateDialog({
  open,
  onOpenChange,
  initialData,
}: LeadNoteUpdateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Note</DialogTitle>
          <DialogDescription>Update the note data.</DialogDescription>
        </DialogHeader>
        {initialData ? (
          <LeadNoteUpdateDialogForm
            initialData={initialData}
            onSuccess={() => onOpenChange(false)}
          />
        ) : (
          <div className="text-center text-xl font-semibold text-destructive py-8">
            Could not load note details
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LeadNoteUpdateDialogForm({
  initialData,
  onSuccess,
}: {
  initialData: {
    leadId: string;
    leadNoteId: string;
    content: string;
    jobId?: string;
  };
  onSuccess: () => void;
}) {
  "use no memo";
  const form = useForm<LeadNoteType>({
    resolver: zodResolver(leadNoteSchema),
    defaultValues: {
      leadId: initialData.leadId,
      jobId: initialData.jobId,
      content: initialData.content,
    },
  });

  const { mutate, isPending } = useLeadNoteUpdate<keyof LeadNoteType>({
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = (e: LeadNoteType) => {
    mutate({
      ...e,
      leadNoteId: initialData.leadNoteId,
    });
  };
  return (
    <LeadNoteForm
      formId="lead_note_create_form"
      form={form}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  );
}
