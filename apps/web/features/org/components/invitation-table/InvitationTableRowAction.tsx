import { DeleteInvitation } from "./DeleteInvitation";

export function InvitationTableRowAction({
  invitationId,
}: {
  invitationId: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <DeleteInvitation invitationId={invitationId} />
    </div>
  );
}
