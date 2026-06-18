import { authRouter } from "@/features/auth/api/auth.router";
import { orgRouter } from "@/features/org/api/org.router";
import { roleRouter } from "@/features/role/api/role.router";
import { uploadRouter } from "@/features/upload/api/upload.router";
import { userRouter } from "@/features/user/api/user.router";

export const router = {
  auth: authRouter,
  role: roleRouter,
  user: userRouter,
  upload: uploadRouter,
  org: orgRouter,
};
