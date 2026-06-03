import {
  acceptOrRejectInvitationProcedure,
  createOrgProcedure,
  inviteMemberProcedure,
  listMemberForSearchProcedure,
  listMemberProcedure,
  orgImpl,
} from "./org.procedure";

export const orgRouter = orgImpl.router({
  create: createOrgProcedure,
  listMember: listMemberProcedure,
  inviteMember: inviteMemberProcedure,
  acceptOrRejectInvitation: acceptOrRejectInvitationProcedure,
  listMemberForSearch: listMemberForSearchProcedure,
});
