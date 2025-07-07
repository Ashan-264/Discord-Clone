import { v } from "convex/values";
import {
  assertServerMember,
  assertServerOwner,
  authenticatedMutation,
  authenticatedQuery,
} from "./helpers";

export const list = authenticatedQuery({
  handler: async (ctx) => {
    const serversMembers = await ctx.db
      .query("serverMembers")
      .withIndex("by_userId", (q) => q.eq("userId", ctx.user._id))
      .collect();
    const servers = await Promise.all(
      serversMembers.map(async ({ serverId }) => {
        const server = await ctx.db.get(serverId);
        if (!server) return null;
        return {
          ...server,
          iconUrl: server.iconId
            ? await ctx.storage.getUrl(server.iconId)
            : null,
        };
      })
    );
    return servers.filter((server) => server !== null);
  },
});

export const get = authenticatedQuery({
  args: { id: v.id("servers") },
  handler: async (ctx, { id }) => {
    await assertServerMember(ctx, id);
    return await ctx.db.get(id);
  },
});

export const members = authenticatedQuery({
  args: {
    id: v.id("servers"),
  },
  handler: async (ctx, { id }) => {
    await assertServerMember(ctx, id);
    const serverMembers = await ctx.db
      .query("serverMembers")
      .withIndex("by_serverId", (q) => q.eq("serverId", id))
      .collect();
    const users = await Promise.all(
      serverMembers.map(async ({ userId }) => {
        return await ctx.db.get(userId);
      })
    );
    return users.filter((user) => user !== null);
  },
});

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

export const remove = authenticatedMutation({
  args: { id: v.id("servers") },
  handler: async (ctx, { id }) => {
    // Check if user is the server owner
    await assertServerOwner(ctx, id);

    // Get all channels in the server
    const channels = await ctx.db
      .query("channels")
      .withIndex("by_serverId", (q) => q.eq("serverId", id))
      .collect();

    // Get all server members
    const serverMembers = await ctx.db
      .query("serverMembers")
      .withIndex("by_serverId", (q) => q.eq("serverId", id))
      .collect();

    // Get all invites for this server
    const invites = await ctx.db
      .query("invites")
      .filter((q) => q.eq(q.field("serverId"), id))
      .collect();

    // Delete all messages in channels
    for (const channel of channels) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_dmOrChannelId", (q) =>
          q.eq("dmOrChannelId", channel._id)
        )
        .collect();

      for (const message of messages) {
        if (message.attatchment) {
          await ctx.storage.delete(message.attatchment);
        }
        await ctx.db.delete(message._id);
      }

      // Delete typing indicators for this channel
      const typingIndicators = await ctx.db
        .query("typingIndicators")
        .withIndex("by_dmOrChannelId", (q) =>
          q.eq("dmOrChannelId", channel._id)
        )
        .collect();

      for (const indicator of typingIndicators) {
        await ctx.db.delete(indicator._id);
      }

      // Delete the channel
      await ctx.db.delete(channel._id);
    }

    // Delete all server members
    for (const member of serverMembers) {
      await ctx.db.delete(member._id);
    }

    // Delete all invites
    for (const invite of invites) {
      await ctx.db.delete(invite._id);
    }

    // Delete server icon if it exists
    const server = await ctx.db.get(id);
    if (server?.iconId) {
      await ctx.storage.delete(server.iconId);
    }

    // Finally delete the server
    await ctx.db.delete(id);
  },
});
