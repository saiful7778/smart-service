import { authRouter } from "@/features/auth/api/auth.router";
import { userRouter } from "@/features/user/api/user.router";

export const router = {
  auth: authRouter,
  user: userRouter,
};
