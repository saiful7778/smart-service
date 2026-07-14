"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { formatEnumValue } from "@workspace/lib/utils";
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
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { useOrgStore } from "@/stores/zustand/org/OrgStoreContext";

import { useInviteOrgMember } from "../api/org.api.hook";
import { inviteOrgMemberSchema, InviteOrgMemberType } from "../org.schema";

export function InviteMemberDialog() {
  "use no memo";
  const [open, setOpen] = useState(false);
  const orgRoles = useOrgStore((state) => state.orgRoles);

  const form = useForm<InviteOrgMemberType>({
    resolver: zodResolver(inviteOrgMemberSchema),
    defaultValues: {
      email: "",
      roleName: "",
    },
  });

  const { mutate, isPending } = useInviteOrgMember<keyof InviteOrgMemberType>({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message: message,
        });
      });
    },
  });

  const handleSubmit = (e: InviteOrgMemberType) => {
    mutate(e);
  };

  const formId = "invite-member-form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger render={<DialogTrigger render={<Button />} />}>
          Invite Member
        </TooltipTrigger>
        <TooltipContent>Invite member</TooltipContent>
      </Tooltip>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Invite a member to your organization
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <InputField
                control={form.control}
                name="email"
                type="email"
                placeholder="Email"
                label="Email Address"
                disabled={isPending}
              />
              <SelectField
                control={form.control}
                name="roleName"
                placeholder="Role"
                label="Member Role"
                disabled={isPending}
                options={orgRoles.map((orgRole) => ({
                  value: orgRole.roleName,
                  label: formatEnumValue(orgRole.roleName),
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
            Invite Member
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
