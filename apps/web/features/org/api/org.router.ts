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
  updateMemberProcedure,
} from "./org.procedure";

export const orgRouter = orgImpl.router({
  create: createOrgProcedure,
  listMember: listMemberProcedure,
  inviteMember: inviteMemberProcedure,
  acceptOrRejectInvitation: acceptOrRejectInvitationProcedure,
  listMemberForSearch: listMemberForSearchProcedure,
  updateMember: updateMemberProcedure,
  listInvitation: listInvitationProcedure,
  updateInvitation: updateInvitationProcedure,
  deleteInvitation: deleteInvitationProcedure,
});
