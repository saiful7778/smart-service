import {
  acceptOrRejectInvitationProcedure,
  createOrgProcedure,
  deleteInvitationProcedure,
  inviteMemberProcedure,
  listInvitationProcedure,
  listMemberForSearchProcedure,
  listMemberProcedure,
  orgImpl,
  updateInvitationProcedure,
} from "./org.procedure";

export const orgRouter = orgImpl.router({
  create: createOrgProcedure,
  listMember: listMemberProcedure,
  inviteMember: inviteMemberProcedure,
  acceptOrRejectInvitation: acceptOrRejectInvitationProcedure,
  listMemberForSearch: listMemberForSearchProcedure,
  listInvitation: listInvitationProcedure,
  updateInvitation: updateInvitationProcedure,
  deleteInvitation: deleteInvitationProcedure,
});
