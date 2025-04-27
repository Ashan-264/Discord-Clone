"node";
import { action } from "./_generated/server";
import { RtcTokenBuilder, RtcRole } from "agora-token";
import { v } from "convex/values";

export const createToken = action({
  args: {
    channelName: v.string(),
    uid: v.string(),
  },
  handler: async (ctx, { channelName, uid }) => {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appId || !appCertificate) {
      throw new Error("Missing AGORA_APP_ID or AGORA_APP_CERTIFICATE");
    }

    const numericUid = Number(uid);
    if (isNaN(numericUid)) {
      throw new Error(`Invalid uid "${uid}", must be a number`);
    }

    // 1 hour in seconds
    const ttl = 3600;
    const now = Math.floor(Date.now() / 1000);
    const tokenExpireTs = now + ttl;
    const privilegeExpireTs = now + ttl;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      numericUid,
      RtcRole.PUBLISHER,
      tokenExpireTs, // <— token expiration
      privilegeExpireTs // <— privilege expiration
    );

    return { token, appId, channelName, uid };
  },
});
