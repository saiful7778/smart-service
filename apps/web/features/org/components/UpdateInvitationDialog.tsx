"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pen } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  formatEnumValue,
  OrgRoleEnumSchema,
  OrgRoleType,
} from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Dialog,
  DialogClose,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { FieldGroup } from "@workspace/ui/components/field";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { useUpdateInvitation } from "../api/org.api.hook";
import { updateInvitationSchema, UpdateInvitationType } from "../org.schema";

export function UpdateInvitationDialog({
  invitationId,
  role,
}: {
  invitationId: string;
  role: OrgRoleType;
}) {
  "use no memo";
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateInvitationType>({
    resolver: zodResolver(updateInvitationSchema),
    defaultValues: {
      invitationId,
      role,
    },
  });

  const { mutate, isPending } = useUpdateInvitation<keyof UpdateInvitationType>(
    {
      onSuccess: () => {
        setOpen(false);
      },
      onValidationErrors: (fields) => {
        fields.forEach(({ fieldName, message }) => {
          form.setError(fieldName, {
            message,
          });
        });
      },
    }
  );

  const handleSubmit = (e: UpdateInvitationType) => {
    mutate(e);
  };

  const formId = "update-invitation-dialog-form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger render={<Button size="icon" variant="outline" />} />
          }
        >
          <Pen />
        </TooltipTrigger>
        <TooltipContent>
          <p>Update Invitation</p>
        </TooltipContent>
      </Tooltip>

      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Update Invitation</DialogTitle>
        </DialogStickyHeader>

        <DialogResponsiveBody>
          <form onSubmit={form.handleSubmit(handleSubmit)} id={formId}>
            <FieldGroup>
              <SelectField
                control={form.control}
                name="role"
                placeholder="Role"
                label="Member Role"
                disabled={isPending}
                options={OrgRoleEnumSchema.options.map((value) => ({
                  value,
                  label: formatEnumValue(value),
                }))}
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>

        <DialogStickyFooter>
          <DialogClose
            render={
              <Button type="button" variant="ghost" disabled={isPending} />
            }
          >
            Cancel
          </DialogClose>
          <ButtonSpinner
            form={formId}
            type="submit"
            className="w-fit"
            isLoading={isPending}
          >
            Update
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
