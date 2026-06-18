"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pen } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { useUpdateOrgRole } from "../api/role.api.hook";
import {
  createOrUpdateOrgRoleSchema,
  CreateOrUpdateOrgRoleType,
} from "../role.schema";
import { OrgRoleForm } from "./OrgRoleForm";

export function UpdateOrgRoleDialog({
  roleId,
  defaultValues,
}: {
  roleId: string;
  defaultValues?: CreateOrUpdateOrgRoleType;
}) {
  "use no memo";
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<CreateOrUpdateOrgRoleType>({
    resolver: zodResolver(createOrUpdateOrgRoleSchema),
    defaultValues: {
      roleName: defaultValues?.roleName || "STAFF",
      description: defaultValues?.description || "",
      customRoleName: defaultValues?.customRoleName || "",
      permissions: defaultValues?.permissions || [],
    },
  });

  const { mutate, isPending } = useUpdateOrgRole<
    keyof CreateOrUpdateOrgRoleType
  >({
    onSuccess: () => {
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

  const formId = "update-custom-role-form";

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={<Button variant="secondary" size="icon" />}
            />
          }
        >
          <Pen />
        </TooltipTrigger>
        <TooltipContent>
          <p>Update this role</p>
        </TooltipContent>
      </Tooltip>

      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Update this role</DialogTitle>
          <DialogDescription>
            Update this role and permissions
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <OrgRoleForm
            formId={formId}
            form={form}
            isSubmitting={isPending}
            onSubmit={(e) => mutate({ ...e, roleId })}
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
            Update
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
