import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import { apiOutputZodSchema } from "@workspace/lib/utils";

import { baseContract } from "@/server/orpc.contract-base";

import { forgetPasswordSchema, userBannedSchema } from "../auth.schema";

const tags = ["Auth"] as const;

const requestResetPasswordContract = baseContract
  .route({
    path: "/auth/request-reset-password",
    tags,
  })
  .input(forgetPasswordSchema)
  .output(apiOutputZodSchema(z.null()));
export type RequestResetPasswordInput = InferContractRouterInputs<
  typeof requestResetPasswordContract
>;
export type RequestResetPasswordOutput = InferContractRouterOutputs<
  typeof requestResetPasswordContract
>["data"];

const userBanContract = baseContract
  .route({
    path: "/auth/ban",
    description: "Ban or unban user",
    tags,
  })
  .input(userBannedSchema)
  .output(apiOutputZodSchema(z.null()));
export type UserBanInput = InferContractRouterInputs<typeof userBanContract>;
export type UserBanOutput = InferContractRouterOutputs<
  typeof userBanContract
>["data"];

export const authContract = {
  requestResetPassword: requestResetPasswordContract,
  ban: userBanContract,
};
