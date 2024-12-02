import { v } from "convex/values";
import { authenticatedMutation } from "./helpers";

export const create = authenticatedMutation({
  args: {
    name: v.string(),
    iconId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { name, iconId }) => {
    const serverId = await ctx.db.insert("servers", {
      name,
      iconId,
      ownerId: ctx.user._id,
    });
    const defaultChannelId = await ctx.db.insert("channels", {
      name: "general",
      serverId,
    });
    await ctx.db.patch(serverId, {
      defaultChannelId,
    });
    await ctx.db.insert("serverMembers", {
      serverId,
      userId: ctx.user._id,
    });
    return { serverId, defaultChannelId };
  },
});
