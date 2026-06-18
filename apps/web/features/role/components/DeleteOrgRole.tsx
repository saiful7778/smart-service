"use client";
import { useState } from "react";

import { Trash2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { useDeleteOrgRole } from "../api/role.api.hook";

export function DeleteOrgRole({ roleId }: { roleId: string }) {
  "use no memo";
  const [openDialog, setOpenDialog] = useState(false);

  const { mutate, isPending } = useDeleteOrgRole({
    onSuccess: () => {
      setOpenDialog(false);
    },
  });

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              variant="destructive"
              onClick={() => setOpenDialog(true)}
            />
          }
        >
          <Trash2 />
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete this role</p>
        </TooltipContent>
      </Tooltip>

      <DeleteConfirmDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onConfirm={() => mutate({ roleId })}
        isLoading={isPending}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete the record."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
