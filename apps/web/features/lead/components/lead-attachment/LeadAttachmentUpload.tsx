"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";

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

import {
  FileUploadField,
  useFileUploadState,
} from "@/components/form-fields/FileUploadField";

import {
  leadAttachmentUploadSchema,
  LeadAttachmentUploadType,
} from "@/features/lead/lead.schema";

import { useLeadAttachmentCreate } from "../../api/leadAttachment.api.hook";

export function LeadAttachmentUploadDialog({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  "use no memo";
  const [open, setOpen] = useState<boolean>(false);
  const { fileValue, setFileValue, fileError, setFileError, uploadRef } =
    useFileUploadState();

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

  const { mutate, isPending } = useLeadAttachmentCreate<
    keyof LeadAttachmentUploadType
  >({
    uploadRef,
    onSuccess: () => {
      form.reset();
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
    if (!fileValue) {
      setFileError("Please select a file");
      return;
    }

    mutate({
      ...e,
      fileValue,
    });
  };

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
                value={fileValue}
                onChange={setFileValue}
                ref={uploadRef}
                disabled={isPending}
                fieldError={fileError}
                onError={setFileError}
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
