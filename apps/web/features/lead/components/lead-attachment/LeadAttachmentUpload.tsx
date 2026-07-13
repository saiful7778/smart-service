"use client";

import { useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { FileUploadRef } from "@/components/FileUpload";
import { FileUploadField } from "@/components/form-fields/FileUploadField";

import {
  leadAttachmentUploadSchema,
  LeadAttachmentUploadType,
} from "@/features/lead/lead.schema";
import { useFileUploadToAPI } from "@/features/upload/hook/useFileUploadToAPI";

import { useLeadAttachmentCreate } from "../../api/lead.api.hook";

export function LeadAttachmentUploadDialog({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  "use no memo";
  const [open, setOpen] = useState<boolean>(false);
  const uploadRef = useRef<FileUploadRef>(null);
  const [attachmentValue, setAttachmentValue] = useState<
    File | File[] | null | undefined
  >(undefined);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const toastId = "upload_attachment_toast_message";

  const form = useForm<LeadAttachmentUploadType>({
    resolver: zodResolver(leadAttachmentUploadSchema),
    defaultValues: {
      leadId,
      jobId,
      title: "",
      description: "",
      category: "",
    },
  });

  const { mutateAsync: uploadFileToAPI, isPending: isUploading } =
    useFileUploadToAPI({
      onRequestStart: () => {
        toast.loading("Uploading...", { id: toastId });
      },
      onSuccess: () => {
        toast.success("Uploaded successfully", { id: toastId });
      },
      onError: (errorMessage) => {
        toast.error(errorMessage, { id: toastId });
      },
    });

  const { mutate: createAttachment, isPending: isCreating } =
    useLeadAttachmentCreate<keyof LeadAttachmentUploadType>({
      onSuccess: () => {
        form.reset();
        uploadRef.current?.clearFiles();
        uploadRef.current?.clearErrors();
        setOpen(false);
      },
      onValidationErrors: (fields) => {
        fields.forEach(({ fieldName, message }) => {
          form.setError(fieldName, {
            message,
          });
        });
      },
    });

  const handleSubmit = async (e: LeadAttachmentUploadType) => {
    if (!attachmentValue) {
      setAttachmentError("Please select a file");
      return;
    }

    const { data } = await uploadFileToAPI({
      file: Array.isArray(attachmentValue)
        ? attachmentValue[0]!
        : attachmentValue,
      entityId: (e.jobId ?? e.leadId)!,
      entityType: e.jobId ? "job_attachment" : "lead_attachment",
    });

    createAttachment({
      ...e,
      fileId: data.id,
    });
  };

  const isPending = isUploading || isCreating;

  const formId = "attachment_upload_form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UploadCloud />
        <span>Upload Attachment</span>
      </DialogTrigger>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Upload Attachment</DialogTitle>
          <DialogDescription>
            Add documents, images, or files related to this lead.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <FileUploadField
                label="Attchment"
                variant="any"
                value={attachmentValue}
                onChange={setAttachmentValue}
                ref={uploadRef}
                disabled={isPending}
                onError={setAttachmentError}
                fieldError={attachmentError}
              />
              <InputField
                control={form.control}
                name="title"
                label="Title"
                placeholder="Enter title"
                disabled={isPending}
              />
              <TextareaField
                control={form.control}
                name="description"
                label="Description"
                placeholder="Enter description"
                disabled={isPending}
              />
              <InputField
                control={form.control}
                name="category"
                label="Category"
                placeholder="Enter category"
                disabled={isPending}
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="ghost" disabled={isPending} />}>
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} isLoading={isPending} type="submit">
            Upload Attachment
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
