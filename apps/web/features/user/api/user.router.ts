import {
  listUserProcedure,
  updateUserProcedure,
  updateUserRoleProcedure,
  userDetailsProcedure,
  userImpl,
  userStatsProcedure,
} from "./user.procedure";

export const userRouter = userImpl.router({
  list: listUserProcedure,
  stats: userStatsProcedure,
  update: updateUserProcedure,
  updateRole: updateUserRoleProcedure,
  details: userDetailsProcedure,
});
