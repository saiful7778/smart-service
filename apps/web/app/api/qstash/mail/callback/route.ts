import { NextRequest, NextResponse } from "next/server";

import { MailCallbackPayload } from "@workspace/mail";

import { mailProvider } from "@/lib/mail";

import { formatApiError } from "@/utils/formatApiError";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const signature = req.headers.get("upstash-signature") ?? "";
    const isValid = await mailProvider.verifySignature(
      body,
      signature,
      req.url
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    let payload: MailCallbackPayload;
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 }
      );
    }

    payload.messageId =
      payload.messageId || req.headers.get("upstash-message-id") || "";

    await mailProvider.processMailCallback(payload, {
      messageId: payload.messageId,
    });

    return NextResponse.json(
      { success: true, message: "success" },
      { status: 200 }
    );
  } catch (err) {
    const { message } = formatApiError(err);

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
