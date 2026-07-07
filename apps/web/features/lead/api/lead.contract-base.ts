import { API_MESSAGES } from "@/constants/apiMessage";
import { baseContract } from "@/server/orpc.contract-base";

export const leadBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.LEAD.NOT_FOUND,
  },
});
