"use client";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Pen } from "lucide-react";
import { useForm } from "react-hook-form";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Card,
  CardAction,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { useLeadUpdate } from "@/features/lead/api/lead.api.hook";
import { LeadDetailsOutputs } from "@/features/lead/api/lead.contract";
import {
  leadAddressesSchema,
  LeadAddressesType,
} from "@/features/lead/lead.schema";

import { AddressesForm } from "../../forms/AddressesForm";

export function AddressDetails({
  leadId,
  addresses,
}: {
  leadId: string;
  addresses: LeadDetailsOutputs["addresses"];
}) {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <span className="font-semibold text-lg">Addresses</span>
          </CardTitle>
          <CardAction>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setOpenDialog(true)}
                  />
                }
              >
                <Pen />
              </TooltipTrigger>
              <TooltipContent>
                <p>Update Address</p>
              </TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          {addresses.length > 0 ? (
            addresses.map((address, idx) => (
              <div
                key={address.id}
                className="space-y-2 last:mb-0 mb-4 p-3 rounded-md bg-muted/50 border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Address #{idx + 1}
                  </span>
                  <MapPin className="size-4 text-muted-foreground" />
                </div>
                <div className="leading-none">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-medium">{address.line1}</h5>
                    {address.isPrimary && <Badge>Primary</Badge>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground pt-2 border-t mt-2">
                  <div className="inline-flex items-center gap-1">
                    <span className="font-semibold text-foreground/70">
                      City:
                    </span>
                    <span>{address.city}</span>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <span className="font-semibold text-foreground/70">
                      State:
                    </span>
                    <span>{address.state}</span>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <span className="font-semibold text-foreground/70">
                      Zip:
                    </span>
                    <span>{address.zipCode}</span>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <span className="font-semibold text-foreground/70">
                      Country:
                    </span>
                    <span>{address.country}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/30 rounded-lg border border-dashed">
              No addresses recorded.
            </div>
          )}
        </CardContent>
      </Card>
      <AddressUpdateDialog
        leadId={leadId}
        addresses={addresses}
        open={openDialog}
        onOpenChange={setOpenDialog}
      />
    </>
  );
}

function AddressUpdateDialog({
  leadId,
  addresses,
  open,
  onOpenChange,
}: {
  leadId: string;
  addresses: LeadDetailsOutputs["addresses"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<LeadAddressesType>({
    resolver: zodResolver(leadAddressesSchema),
    defaultValues: {
      addresses: addresses.map((addr) => ({
        id: addr.id,
        line1: addr.line1 ?? "",
        city: addr.city ?? "",
        state: addr.state ?? "",
        zipCode: addr.zipCode ?? "",
        isPrimary: addr.isPrimary ?? false,
      })),
    },
  });

  const { mutate, isPending } = useLeadUpdate<keyof LeadAddressesType>({
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

  const handleSubmit = (e: LeadAddressesType) => {
    mutate({
      ...e,
      leadId,
    });
  };

  const formId = "lead_address_update_form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Update Address</DialogTitle>
          <DialogDescription>
            Update the address for this lead.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <AddressesForm
            form={form}
            formId={formId}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Update Address
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
