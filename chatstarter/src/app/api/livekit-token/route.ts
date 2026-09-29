import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    if (!serverId) {
      return NextResponse.json({ error: "Missing serverId" }, { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LIVEKIT_API_KEY / SECRET not configured" },
        { status: 500 }
      );
    }

    // Identity must be unique per participant: LiveKit disconnects an existing
    // participant when a new one joins with the same identity, so keying this on
    // serverId let each joiner kick the previous occupant out of the room.
    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
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
