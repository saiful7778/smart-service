import { OrgRoleType } from "@workspace/lib/utils";

import { ListInvitationContractType } from "../../api/org.contract";
import { UpdateInvitationDialog } from "../UpdateInvitationDialog";
import { DeleteInvitation } from "./DeleteInvitation";

export function InvitationTableRowAction({
  invitationData,
}: {
  invitationData: ListInvitationContractType["output"]["data"]["data"][number];
}) {
  return (
    <div className="flex items-center gap-2">
      {invitationData.status === "pending" && (
        <UpdateInvitationDialog
          invitationId={invitationData.id}
          role={invitationData.role as OrgRoleType}
        />
      )}
      <DeleteInvitation invitationId={invitationData.id} />
    </div>
  );
}
