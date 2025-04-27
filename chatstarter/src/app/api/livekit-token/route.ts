import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    if (!serverId) {
      return NextResponse.json({ error: "Missing serverId" }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LIVEKIT_API_KEY / SECRET not configured" },
        { status: 500 }
      );
    }

    // Build a short-lived token (1h)
    const at = new AccessToken(apiKey, apiSecret, {
      identity: serverId,
    });
    at.addGrant({ room: serverId, roomJoin: true });
    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (e: Error | unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
