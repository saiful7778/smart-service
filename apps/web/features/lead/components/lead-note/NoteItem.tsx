"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { formatDate } from "date-fns";
import { Edit, EllipsisVertical, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import { UserAvatarImage } from "@/components/UserAvatar";

import { RoutePathType } from "@/types";
import { nameInitials } from "@/utils/nameInitials";

import { ListLeadNotesOutputs } from "../../api/leadNote.contract";

interface LeadNoteItemProps {
  note: ListLeadNotesOutputs["data"][number];
  handleDeleteDialog: (noteId: string) => void;
  handleUpdateDialog: (noteId: string) => void;
}

export function LeadNoteItem({
  note,
  handleDeleteDialog,
  handleUpdateDialog,
}: LeadNoteItemProps) {
  const pathname = usePathname();

  return (
    <div className="p-3 space-y-2 bg-card border rounded-md">
      <div className="flex items-center justify-between gap-1">
        <div className="inline-flex items-center gap-1">
          <Avatar className="size-6">
            <UserAvatarImage
              image={note.createdBy.image}
              alt={note.createdBy.name}
            />
            <AvatarFallback>{nameInitials(note.createdBy.name)}</AvatarFallback>
          </Avatar>
          <div className="text-xs font-medium">{note.createdBy.name}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <EllipsisVertical />
            <span className="sr-only">Options</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  handleUpdateDialog(note.id);
                }}
              >
                <Edit />
                <span>Update</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  handleDeleteDialog(note.id);
                }}
              >
                <Trash2 />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-sm leading-relaxed">{note.content}</p>
      <div className="flex items-end-safe justify-between gap-2">
        <div className="text-muted-foreground text-xs">
          {formatDate(note.createdAt, "P • p")}
        </div>
        {pathname.startsWith("/dashboard/organization/leads") && note.job && (
          <div>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  href={
                    `/dashboard/organization/jobs/${note.job.id}` as RoutePathType
                  }
                />
              }
            >
              View Job
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
