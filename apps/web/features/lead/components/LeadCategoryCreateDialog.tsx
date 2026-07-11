"use client";

import { useState } from "react";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import { LeadCategoryCreateForm } from "./forms/LeadCategoryCreateForm";

export function LeadCategoryCreateDialog() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Create New</DialogTrigger>
      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Create Lead Category</DialogTitle>
          <DialogDescription>Create a new lead category</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <LeadCategoryCreateForm onSuccess={() => setOpen(false)} />
        </DialogResponsiveBody>
      </DialogResponsiveContent>
    </Dialog>
  );
}
