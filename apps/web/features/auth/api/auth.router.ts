import {
  authImpl,
  requestResetPasswordProcedure,
  userBanProcedure,
} from "./auth.procedure";

export const authRouter = authImpl.router({
  requestResetPassword: requestResetPasswordProcedure,
  ban: userBanProcedure,
});
