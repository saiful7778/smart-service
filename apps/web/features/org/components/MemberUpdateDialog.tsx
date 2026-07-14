"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pen } from "lucide-react";
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
import { TagsField } from "@workspace/ui/components/form-fields/TagsField";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { useOrgStore } from "@/stores/zustand/org/OrgStoreContext";

import { useUpdateMember } from "../api/org.api.hook";
import { updateMemberSchema, UpdateMemberType } from "../org.schema";

export function MemberUpdateDialog({
  memberId,
  roleIds,
}: {
  memberId: string;
  roleIds: string[];
}) {
  "use no memo";
  const [openDialog, setOpenDialog] = useState(false);
  const orgRoles = useOrgStore((state) => state.orgRoles);

  const form = useForm<UpdateMemberType>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: {
      memberId,
      roleIds,
    },
  });

  const { isPending, mutate } = useUpdateMember<keyof UpdateMemberType>({
    onSuccess: () => {
      form.reset();
      setOpenDialog(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = (e: UpdateMemberType) => {
    mutate(e);
  };

  const formId = "update-member-form";

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger render={<Button variant="outline" size="icon" />} />
          }
        >
          <Pen />
        </TooltipTrigger>
        <TooltipContent>
          <p>Update Member</p>
        </TooltipContent>
      </Tooltip>

      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Update Member</DialogTitle>
          <DialogDescription>Carefully update member details</DialogDescription>
        </DialogStickyHeader>

        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <TagsField
                control={form.control}
                name="roleIds"
                placeholder="Roles"
                label="Member Roles"
                disabled={isPending}
                options={orgRoles.map((orgRole) => ({
                  value: orgRole.id,
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
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Update Member
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
