import { NextRequest } from "next/server";

import { formatApiError } from "@workspace/lib/utils";
import { MailCallbackPayload } from "@workspace/mail";

import { ApiResponseJson } from "@/lib/ApiResponseJson";
import { mailProvider } from "@/lib/mail";
import { getQstashPayload } from "@/lib/qstash/getQstashPayload";
import { verifyQstashSignature } from "@/lib/qstash/verifyQstashSignature";

export async function POST(req: NextRequest) {
  try {
    const clonedReq = req.clone();

    await verifyQstashSignature(req);

    const payload = await getQstashPayload<MailCallbackPayload>(clonedReq);

    await mailProvider.processMailCallback(payload, {
      messageId: payload.messageId,
    });

    return ApiResponseJson(true, "success");
  } catch (err) {
    const { message, statusCode } = formatApiError(err);

    return ApiResponseJson(false, message, undefined, statusCode);
  }
}
