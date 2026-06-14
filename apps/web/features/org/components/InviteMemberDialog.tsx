"use client";

import { useState } from "react";

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

import InviteMemberForm from "./forms/InviteMemberForm";

export default function InviteMemberDialog() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const formId = "invite-member-form";

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Invite Member</DialogTrigger>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Invite a member to your organization
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <InviteMemberForm
            formId={formId}
            onSubmittingChange={setIsSubmitting}
          />
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose
            render={
              <Button type="button" variant="ghost" disabled={isSubmitting} />
            }
          >
            Cancel
          </DialogClose>
          <ButtonSpinner
            form={formId}
            type="submit"
            className="w-fit"
            isLoading={isSubmitting}
          >
            Invite Member
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
