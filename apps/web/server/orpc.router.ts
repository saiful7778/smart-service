import { authRouter } from "@/features/auth/api/auth.router";
import { orgRouter } from "@/features/org/api/org.router";
import { uploadRouter } from "@/features/upload/api/upload.router";
import { userRouter } from "@/features/user/api/user.router";

export const router = {
  auth: authRouter,
  user: userRouter,
  upload: uploadRouter,
  org: orgRouter,
};
