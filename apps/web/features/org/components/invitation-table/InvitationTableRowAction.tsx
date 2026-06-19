import { OrgRoleType } from "@workspace/lib/utils";

import { UpdateInvitationDialog } from "../UpdateInvitationDialog";
import { DeleteInvitation } from "./DeleteInvitation";

export function InvitationTableRowAction({
  invitationId,
  role,
}: {
  invitationId: string;
  role: OrgRoleType;
}) {
  return (
    <div className="flex items-center gap-2">
      <UpdateInvitationDialog invitationId={invitationId} role={role} />
      <DeleteInvitation invitationId={invitationId} />
    </div>
  );
}
