import { NextRequest, NextResponse } from "next/server";

import { mailProvider } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = req.headers.get("upstash-signature") ?? "";
  const isValid = await mailProvider.verifySignature(body, signature, req.url);

  if (!isValid) {
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
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
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  try {
    await mailProvider.handleFailed(payload.sourceMessageId);

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
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
