"use client";

import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";

export function AcceptEstimateButton({ estimateId }: { estimateId: string }) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const toastId = "accept_toast_message";

  const { mutate, isPending } = useMutation({
    mutationFn: async (estimateId: string) => {
      const res = await fetch(`/api/estimates/${estimateId}/accept`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to accept estimate.");
      }

      return data;
    },
    onMutate: () => {
      toast.loading("Accepting...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Estimate accepted successfully!", { id: toastId });
      setShowAcceptDialog(false);
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.", {
        id: toastId,
      });
    },
  });

  const handleAccept = () => {
    mutate(estimateId);
  };

  return (
    <>
      <Button onClick={() => setShowAcceptDialog(true)}>
        <Check />
        <span>Accept Estimate</span>
      </Button>
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              By accepting this estimate, you agree to the terms and conditions
              outlined. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              render={
                <Button
                  variant="outline"
                  disabled={isPending}
                  aria-disabled={isPending}
                />
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
              render={
                <ButtonSpinner variant="destructive" isLoading={isPending} />
              }
            >
              Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
