import { authRouter } from "@/features/auth/api/auth.router";
import { jobRouter } from "@/features/job/api/job.router";
import { leadRouter } from "@/features/lead/api/lead.router";
import { notificationRouter } from "@/features/notification/api/notification.router";
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
  lead: leadRouter,
  notification: notificationRouter,
  job: jobRouter,
};
