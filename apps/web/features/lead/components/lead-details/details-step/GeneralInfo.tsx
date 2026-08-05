"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, FileText, Layers, Pen, Wrench } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  LeadSourceEnumType,
  LeadStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
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

import { useLeadUpdate } from "@/features/lead/api/lead.api.hook";
import {
  generalInfoSchema,
  GeneralInfoType,
} from "@/features/lead/lead.schema";

import { GeneralInfoUpdateForm } from "../../forms/GeneralInfoForm";

interface GeneralInfoProps {
  leadId: string;
  status: LeadStatusEnumType;
  serviceType: string | null;
  source: LeadSourceEnumType;
  leadCategories: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  description: string | null;
}

export function GeneralInfo({
  leadId,
  status,
  serviceType,
  source,
  leadCategories,
  description,
}: GeneralInfoProps) {
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
            <InfoItem label="Status" icon={<Clock className="size-3" />}>
              <Status
                variant={
                  status === "converted"
                    ? "success"
                    : status === "cancelled"
                      ? "error"
                      : status === "contacted" || status === "qualified"
                        ? "info"
                        : status === "lost"
                          ? "warning"
                          : "default"
                }
              >
                <StatusIndicator />
                <StatusLabel>{formatEnumValue(status)}</StatusLabel>
              </Status>
            </InfoItem>
            <InfoItem label="Service" icon={<Wrench className="size-3" />}>
              {serviceType ?? "Not specified"}
            </InfoItem>
            <InfoItem label="Platform" icon={<Layers className="size-3" />}>
              {formatEnumValue(source)}
            </InfoItem>
          </div>
        </CardContent>
        <Separator />
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Layers className="size-3" />
              <span>Service Categories</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {leadCategories.length > 0 ? (
                leadCategories.map((category) =>
                  category?.description ? (
                    <Tooltip key={category.id}>
                      <TooltipTrigger>
                        <Badge variant="secondary">{category.name}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{category.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  )
                )
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  No categories assigned
                </span>
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
      <GeneralInfoUpdateDialog
        open={openUpdateDialog}
        onOpenChange={setOpenUpdateDialog}
        initialData={{
          leadId,
          status,
          serviceType,
          leadCategories,
          description,
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

interface GeneralInfoUpdateDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  initialData?:
    | {
        leadId: string;
        status: LeadStatusEnumType;
        serviceType: string | null;
        leadCategories: Array<{ id: string; name: string }>;
        description: string | null;
      }
    | undefined;
}

export function GeneralInfoUpdateDialog({
  open,
  onOpenChange,
  initialData,
}: GeneralInfoUpdateDialogProps) {
  "use no memo";
  const form = useForm<GeneralInfoType>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      status: initialData?.status,
      serviceType: initialData?.serviceType ?? "",
      categories: initialData?.leadCategories.map(({ id }) => id),
      description: initialData?.description ?? "",
    },
  });

  const { mutate, isPending } = useLeadUpdate<keyof GeneralInfoType>({
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = (e: GeneralInfoType) => {
    const leadId = initialData?.leadId;
    if (!leadId) return;
    mutate({
      leadId,
      status: e.status,
      serviceType: e.serviceType || null,
      categories: e.categories,
      description: e.description || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Update General Information</DialogTitle>
          <DialogDescription>
            Update the general information of this lead.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          {initialData ? (
            <GeneralInfoUpdateForm
              formId="general_info_update_form"
              form={form}
              onSubmit={handleSubmit}
              disabled={isPending}
            />
          ) : (
            <div className="text-center text-xl font-semibold text-destructive py-8">
              Could not load lead details
            </div>
          )}
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner
            form="general_info_update_form"
            type="submit"
            isLoading={isPending}
          >
            Update Info
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
