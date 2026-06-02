import { NextRequest, NextResponse } from "next/server";

import { MailCallbackPayload } from "@workspace/mail";

import { mailProvider } from "@/lib/mail";

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
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    let payload: MailCallbackPayload;
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    payload.messageId =
      payload.messageId || req.headers.get("upstash-message-id") || "";

    await mailProvider.processMailCallback(payload, {
      messageId: payload.messageId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to process callback",
      },
      { status: 500 }
    );
  }
}
