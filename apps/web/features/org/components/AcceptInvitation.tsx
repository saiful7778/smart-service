"use client";

import { useRouter } from "next/navigation";

import { BorderBeam } from "@workspace/ui/components/border-beam";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";

import { DEFAULT_AUTH_PATH } from "@/constants";

import { useAcceptOrRejectInvitation } from "../api/org.api.hook";

export function AcceptInvitation({ invitationId }: { invitationId: string }) {
  const router = useRouter();

  const { mutateAsync: acceptOrRejectInvitation, isPending } =
    useAcceptOrRejectInvitation({
      onSuccess: () => {
        router.refresh();
      },
    });

  const handleAccept = async () => {
    await acceptOrRejectInvitation({
      invitationId,
      action: "accept",
    });

    router.push(DEFAULT_AUTH_PATH);
  };

  const handleReject = async () => {
    await acceptOrRejectInvitation({
      invitationId,
      action: "reject",
    });

    router.push("/");
  };

  return (
    <div className="flex items-center gap-3">
      <ButtonSpinner
        className="flex-1"
        variant="destructive"
        isLoading={isPending}
        onClick={handleReject}
      >
        Reject
      </ButtonSpinner>
      <ButtonSpinner
        className="flex-1 relative"
        isLoading={isPending}
        onClick={handleAccept}
      >
        Accept
        <BorderBeam size={30} />
      </ButtonSpinner>
    </div>
  );
}
