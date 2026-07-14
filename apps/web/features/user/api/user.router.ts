import {
  listUserProcedure,
  updateUserProcedure,
  updateUserRoleProcedure,
  userDataExportProcedure,
  userDetailsProcedure,
  userImpl,
  userStatsProcedure,
} from "./user.procedure";

export const userRouter = userImpl.router({
  list: listUserProcedure,
  export: userDataExportProcedure,
  stats: userStatsProcedure,
  update: updateUserProcedure,
  updateRole: updateUserRoleProcedure,
  details: userDetailsProcedure,
});
