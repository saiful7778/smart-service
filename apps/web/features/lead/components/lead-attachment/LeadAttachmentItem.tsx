"use client";
import Link from "next/link";
import { useCallback, useState } from "react";

import { formatDate } from "date-fns";
import {
  Eye,
  FileIcon,
  FileImage,
  FileText,
  FileVideo,
  Trash,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@workspace/ui/components/button";
import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item";

import { UserAvatar } from "@/components/UserAvatar";

import { useGetDownloadUrl } from "@/features/upload/api/upload.api.hook";
import { formatBytes } from "@/utils/formatBytes";

import { useLeadAttachmentDelete } from "../../api/lead.api.hook";
import { ListLeadAttachmentOutput } from "../../api/leadAttachment.contract";

type LeadAttachmentItem = ListLeadAttachmentOutput[number];

interface LeadAttachmentItemProps {
  attachment: Omit<LeadAttachmentItem, "uploadedBy"> & {
    uploadedBy: LeadAttachmentItem["uploadedBy"] | null;
  };
}

function getFileIcon(mimeType: string): React.ReactNode {
  if (mimeType.startsWith("image/")) return <FileImage />;
  if (mimeType.startsWith("video/")) return <FileVideo />;
  if (mimeType === "application/pdf") return <FileText />;
  if (
    mimeType.includes("word") ||
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet")
  )
    return <FileText />;
  return <FileIcon />;
}

export function LeadAttachmentItem({ attachment }: LeadAttachmentItemProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const icon = getFileIcon(attachment.file.mimeType);
  const { mutateAsync: getDownloadUrl } = useGetDownloadUrl({
    onError: (errorMessage) => {
      toast.error(errorMessage);
    },
  });
  const { mutate: deleteLeadAttachment, isPending: isLeadAttachmentDeleting } =
    useLeadAttachmentDelete({
      onSuccess: () => {
        setOpenDeleteDialog(false);
      },
    });

  const handleFileView = useCallback(async () => {
    const { data } = await getDownloadUrl({
      key: attachment.file.key,
      entityType: attachment.jobId ? "job_attachment" : "lead_attachment",
    });
    window.open(data.signedUrl, "_blank");
  }, [attachment.file.key, attachment.jobId, getDownloadUrl]);

  const handleFileDelete = useCallback(() => {
    deleteLeadAttachment({
      jobId: attachment.jobId,
      leadId: attachment.leadId,
      attachmentId: attachment.id,
    });
  }, [
    attachment.leadId,
    attachment.id,
    attachment.jobId,
    deleteLeadAttachment,
  ]);

  return (
    <>
      <Item
        variant="muted"
        className="transition-all hover:shadow-md shadow items-start"
      >
        <ItemMedia
          variant="icon"
          className="size-9 items-center justify-center rounded-md bg-muted text-muted-foreground [&>svg]:size-4"
        >
          {icon}
        </ItemMedia>
        <ItemContent className="gap-1.5">
          <div className="leading-none">
            <ItemTitle className="line-clamp-1 text-sm font-medium">
              {attachment.title || attachment.file.originalName}
            </ItemTitle>
            <ItemDescription className="text-xs flex items-center gap-1">
              <span>{formatBytes(attachment.file.size)}</span>
              <span>•</span>
              <span>
                {attachment.file.filename.split(".").pop()?.toUpperCase()}
              </span>
              <span>•</span>
              <span>{formatDate(attachment.uploadedAt, "P - p")}</span>
            </ItemDescription>
          </div>
          {(attachment.uploadedBy || attachment.jobId) && (
            <div className="pt-1 flex items-center">
              {attachment.uploadedBy && (
                <UserAvatar
                  userName={attachment.uploadedBy.name}
                  userEmail={attachment.uploadedBy.email}
                  imageUrl={attachment.uploadedBy.image}
                  userRoles={attachment.uploadedBy.roles}
                  showDetails
                  showRoleDetails
                />
              )}
              {attachment.jobId && (
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  className="ml-auto"
                  render={
                    <Link
                      href={{
                        pathname: `/dashboard/organization/jobs/${attachment.jobId}`,
                        search: "tab=attachments",
                      }}
                    />
                  }
                >
                  View Job
                </Button>
              )}
            </div>
          )}
        </ItemContent>
        <ItemActions className="flex-col">
          <Button onClick={handleFileView} variant="secondary" size="icon">
            <Eye />
          </Button>
          <Button
            onClick={() => setOpenDeleteDialog(true)}
            variant="destructive"
            size="icon"
            disabled={isLeadAttachmentDeleting}
          >
            <Trash />
          </Button>
        </ItemActions>
      </Item>
      <DeleteConfirmDialog
        title="Delete Lead Attachment"
        description="Are you sure you want to delete this lead attachment?"
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleFileDelete}
        isLoading={isLeadAttachmentDeleting}
      />
    </>
  );
}
