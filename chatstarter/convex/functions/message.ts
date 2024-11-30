import { v } from "convex/values";
import {
  assertMember,
  authenticatedMutation,
  authenticatedQuery,
} from "./helpers";
import { internal } from "../_generated/api";

export const list = authenticatedQuery({
  args: {
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
  },
  handler: async (ctx, { dmOrChannelId }) => {
    await assertMember(ctx, dmOrChannelId);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_dmOrChannelId", (q) =>
        q.eq("dmOrChannelId", dmOrChannelId)
      )
      .collect();
    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.sender);
        const attatchment = message.attatchment
          ? await ctx.storage.getUrl(message.attatchment)
          : undefined;
        return {
          ...message,
          attatchment,
          sender,
        };
      })
    );
  },
});

export const create = authenticatedMutation({
  args: {
    content: v.string(),
    attatchment: v.optional(v.id("_storage")),
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
  },
  handler: async (ctx, { content, attatchment, dmOrChannelId }) => {
    await assertMember(ctx, dmOrChannelId);
    const messageId = await ctx.db.insert("messages", {
      content,
      attatchment,
      dmOrChannelId,
      sender: ctx.user._id,
    });
    ctx.scheduler.runAfter(0, internal.functions.typing.remove, {
      dmOrChannelId,
      user: ctx.user._id,
    });
    await ctx.scheduler.runAfter(0, internal.functions.moderation.run, {
      id: messageId,
    });
  },
});

export const remove = authenticatedMutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, { id }) => {
    const message = await ctx.db.get(id);
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.sender !== ctx.user._id) {
      throw new Error("You are not authorized to delete this message");
    }
    await ctx.db.delete(id);
    if (message.attatchment) {
      await ctx.storage.delete(message.attatchment);
    }
  },
});

export const generateUploadUrl = authenticatedMutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
