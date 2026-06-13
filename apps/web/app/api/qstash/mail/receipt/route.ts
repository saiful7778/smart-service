import { NextRequest, NextResponse } from "next/server";

import { mailProvider } from "@/lib/mail";

import { formatApiError } from "@/utils/formatApiError";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = req.headers.get("upstash-signature") ?? "";
  const isValid = await mailProvider.verifySignature(body, signature, req.url);

  if (!isValid) {
    return NextResponse.json(
      { success: false, message: "Invalid signature" },
      { status: 401 }
    );
  }

  let payload: {
    body: string;
    sourceMessageId: string;
    sourceBody: string;
    maxRetries: number;
    notBefore: number;
    createdAt: number;
  };

  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 }
    );
  }

  try {
    await mailProvider.handleDeliveryReceipt(payload.sourceMessageId);
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
