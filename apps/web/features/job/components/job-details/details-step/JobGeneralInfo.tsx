"use client";

import Link from "next/link";
import { useState } from "react";

import { Eye, FileText, Layers, Pen, User } from "lucide-react";

import { JobStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@workspace/ui/components/status";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { UserAvatar } from "@/components/UserAvatar";

import { UserProfileType } from "@/features/user/user.api-schema";

import { LeadJobUpdateDialog } from "../../LeadJobUpdateDialog";

interface JobGeneralInfoProps {
  leadId: string | null | undefined;
  jobId: string;
  title: string;
  status: JobStatusEnumType;
  serviceAt: Date | null;
  createdBy: UserProfileType;
  description: string | null;
}

export function JobGeneralInfo({
  leadId,
  jobId,
  status,
  createdBy,
  description,
  title,
  serviceAt,
}: JobGeneralInfoProps) {
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <span className="font-semibold text-lg">General Information</span>
            <div className="ml-auto">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => setOpenUpdateDialog(true)}
                    />
                  }
                >
                  <Pen />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update General Info</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Status" icon={<Layers className="size-3" />}>
              <Status
                variant={
                  status === "completed"
                    ? "success"
                    : status === "cancelled"
                      ? "error"
                      : status === "scheduled" || status === "in_progress"
                        ? "info"
                        : "default"
                }
              >
                <StatusIndicator />
                <StatusLabel>{formatEnumValue(status)}</StatusLabel>
              </Status>
            </InfoItem>
            <InfoItem label="Created By" icon={<User className="size-3" />}>
              <UserAvatar
                userName={createdBy.name}
                userEmail={createdBy.email}
                imageUrl={createdBy.image}
                userRoles={createdBy.roles}
                showDetails
                showRoleDetails
              />
            </InfoItem>
          </div>
        </CardContent>
        <Separator />
        <CardContent>
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <FileText className="size-3" />
              <span>Lead Details</span>
            </h4>
            <div>
              {leadId ? (
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link
                      href={{
                        pathname: `/dashboard/organization/leads/${leadId}`,
                        search: "tab=details",
                      }}
                    />
                  }
                >
                  <Eye />
                  <span>View Lead Details</span>
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Lead is not attached
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardContent>
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <FileText className="size-3" />
              <span>Detailed Description</span>
            </h4>
            <p className="text-sm leading-relaxed text-foreground bg-muted/50 p-3 rounded-lg border border-dashed">
              {description || (
                <span className="italic text-muted-foreground">
                  No description provided for this lead.
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
      <LeadJobUpdateDialog
        open={openUpdateDialog}
        onOpenChange={setOpenUpdateDialog}
        leadId={leadId}
        jobId={jobId}
        initialData={{
          title,
          description: description || undefined,
          status,
          serviceAt: serviceAt || undefined,
        }}
      />
    </>
  );
}

function InfoItem({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium pl-4">{children}</div>
    </div>
  );
}
