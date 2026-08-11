"use client";

import Link from "next/link";

import {
  Eye,
  FileIcon,
  FileImage,
  FileText,
  FileVideo,
  RotateCcw,
  Trash,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@workspace/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { FormatDateCell } from "@/components/shared/format-date/FormatDateCell";
import { UserAvatar } from "@/components/UserAvatar";

import { useGetDownloadUrl } from "@/features/upload/api/upload.api.hook";
import { formatBytes } from "@/utils/formatBytes";

import { ListLeadAttachmentContractType } from "../../api/leadAttachment.contract";
import { ListLeadAttachmentBinContractType } from "../../api/leadAttachmentBin.contract";
import { useLeadAttachmentContext } from "./LeadAttachmentContext";

type LeadAttachmentItem =
  ListLeadAttachmentContractType["output"]["data"][number];

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

interface LeadAttachmentItemProps {
  attachment: LeadAttachmentItem;
}

export function LeadAttachmentItem({ attachment }: LeadAttachmentItemProps) {
  const { jobId, handleDeleteDialog } = useLeadAttachmentContext();

  const { mutateAsync: getDownloadUrl } = useGetDownloadUrl({
    onError: (errorMessage) => {
      toast.error(errorMessage);
    },
  });

  const icon = getFileIcon(attachment.file.mimeType);

  const handleFileView = async () => {
    const { data } = await getDownloadUrl({
      key: attachment.file.key,
      entityType: jobId ? "job_attachment" : "lead_attachment",
    });
    window.open(data.signedUrl, "_blank");
  };

  return (
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
            <FormatDateCell format="P - p" value={attachment.uploadedAt} />
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
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={handleFileView}
                variant="secondary"
                size="icon"
              />
            }
          >
            <Eye />
            <span className="sr-only">view file</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>View file</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={() => handleDeleteDialog(attachment.id)}
                variant="destructive"
                size="icon"
              />
            }
          >
            <Trash />
            <span className="sr-only">delete file</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete file</p>
          </TooltipContent>
        </Tooltip>
      </ItemActions>
    </Item>
  );
}

type LeadAttachmentBinItem =
  ListLeadAttachmentBinContractType["output"]["data"][number];

interface LeadAttachmentBinItemProps {
  attachment: LeadAttachmentBinItem;
}

export function LeadAttachmentBinItem({
  attachment,
}: LeadAttachmentBinItemProps) {
  const { handleRestoreDialog, handleBinDeleteDialog } =
    useLeadAttachmentContext();

  const icon = getFileIcon(attachment.file.mimeType);

  return (
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
            <FormatDateCell format="P - p" value={attachment.uploadedAt} />
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
          </div>
        )}
      </ItemContent>
      <ItemActions className="flex-col">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={() => handleRestoreDialog(attachment.id)}
                variant="secondary"
                size="icon"
              />
            }
          >
            <RotateCcw />
            <span className="sr-only">restore attachment</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Restore</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={() => handleBinDeleteDialog(attachment.id)}
                variant="destructive"
                size="icon"
              />
            }
          >
            <Trash />
            <span className="sr-only"></span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Permanently delete</p>
          </TooltipContent>
        </Tooltip>
      </ItemActions>
    </Item>
  );
}
