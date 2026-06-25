"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
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

import { useCreateOrgRole } from "../api/role.api.hook";
import {
  createOrUpdateOrgRoleSchema,
  CreateOrUpdateOrgRoleType,
} from "../role.schema";
import { OrgRoleForm } from "./OrgRoleForm";

export function CreateOrgRoleDialog() {
  "use no memo";
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<CreateOrUpdateOrgRoleType>({
    resolver: zodResolver(createOrUpdateOrgRoleSchema),
    defaultValues: {
      roleName: "",
      description: "",
      permissions: [],
    },
  });

  const { mutate, isPending } = useCreateOrgRole<
    keyof CreateOrUpdateOrgRoleType
  >({
    onSuccess: () => {
      form.reset();
      setOpenDialog(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message: message,
        });
      });
    },
  });

  const formId = "create-custom-role-form";

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger render={<Button />}>Create a Role</DialogTrigger>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Create custom role</DialogTitle>
          <DialogDescription>
            Customize role to specific permissions
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <OrgRoleForm
            formId={formId}
            form={form}
            isSubmitting={isPending}
            onSubmit={mutate}
          />
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
            Submit
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
