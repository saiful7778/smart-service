"use client";

import { useState } from "react";

import { Trash } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

import { useLeadCategoryDelete } from "../../api/lead.api.hook";
import { ListLeadCategoriesOutput } from "../../api/leadCategory.contract";
import { LeadCategoryUpdateDialog } from "../LeadCategoryUpdateDialog";

export function LeadCategoryTableRowAction({
  category,
}: {
  category: ListLeadCategoriesOutput[number];
}) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const isAllowUpdate = usePermissionCheckWithOrg([
    "org.lead_category.manage",
    "org.lead_category.update",
  ]);
  const isAllowDelete = usePermissionCheckWithOrg([
    "org.lead_category.manage",
    "org.lead_category.delete",
  ]);

  const { mutate, isPending } = useLeadCategoryDelete({
    onSuccess: () => {
      setOpenDeleteDialog(false);
    },
  });

  const handleDelete = () => {
    mutate({
      categoryId: category.id,
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isAllowUpdate && (
          <LeadCategoryUpdateDialog
            categoryId={category.id}
            initialData={{
              name: category.name,
              slug: category.slug,
              description: category.description || "",
            }}
          />
        )}
        {isAllowDelete && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => setOpenDeleteDialog(true)}
                  size="icon"
                  variant="destructive"
                />
              }
            >
              <Trash />
              <span className="sr-only">delete</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDelete}
        isLoading={isPending}
        title="Delete Permanently?"
        description="This item will be permanently deleted and cannot be recovered. Are you sure you want to continue?"
        confirmText="Delete Permanently"
      />
    </>
  );
}
