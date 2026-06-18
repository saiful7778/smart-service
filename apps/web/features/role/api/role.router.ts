import {
  createOrgRoleProcudure,
  deleteOrgRoleProcedure,
  listOrgPermissionProcedure,
  listOrgRoleProcedure,
  listRoleProcedure,
  roleImpl,
  updateOrgRoleProcedure,
} from "./role.procedure";

export const roleRouter = roleImpl.router({
  listRole: listRoleProcedure,
  listOrgPermission: listOrgPermissionProcedure,
  listOrgRole: listOrgRoleProcedure,
  createOrgRole: createOrgRoleProcudure,
  updateOrgRole: updateOrgRoleProcedure,
  deleteOrgRole: deleteOrgRoleProcedure,
});
