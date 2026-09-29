import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  assertChannelMember,
  authenticatedMutation,
  authenticatedQuery,
} from "./helpers";
import { internalMutation } from "../_generated/server";

// How long a typing indicator stays alive after the last keystroke.
const TYPING_TIMEOUT_MS = 5000;

export const list = authenticatedQuery({
  args: {
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
  },
  handler: async (ctx, { dmOrChannelId }) => {
    await assertChannelMember(ctx, dmOrChannelId);
    const typingIndicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_dmOrChannelId", (q) =>
        q.eq("dmOrChannelId", dmOrChannelId)
      )
      .filter((q) => q.neq(q.field("user"), ctx.user._id))
      .filter((q) => q.gt(q.field("expireAt"), Date.now()))
      .collect();
    return await Promise.all(
      typingIndicators.map(async (indicator) => {
        const user = await ctx.db.get(indicator.user);
        if (!user) {
          throw new Error("User does not exist");
        }
        return user.username;
      })
    );
  },
});
export const upsert = authenticatedMutation({
  args: {
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
  },
  handler: async (ctx, { dmOrChannelId }) => {
    await assertChannelMember(ctx, dmOrChannelId);
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_dmOrChannelId", (q) =>
        q.eq("user", ctx.user._id).eq("dmOrChannelId", dmOrChannelId)
      )
      .unique();
    // Milliseconds since the epoch, to match Date.now() everywhere else.
    const expireAt = Date.now() + TYPING_TIMEOUT_MS;

    // Schedule a cleanup for *every* upsert, not just the first one. `remove`
    // only deletes when the stored expireAt still matches the one it was
    // scheduled with, so superseded cleanups are no-ops and the newest keystroke
    // always owns the deletion.
    await ctx.scheduler.runAfter(
      TYPING_TIMEOUT_MS,
      internal.functions.typing.remove,
      {
        dmOrChannelId,
        user: ctx.user._id,
        expireAt,
      }
    );

    if (existing) {
      await ctx.db.patch(existing._id, { expireAt });
      return existing._id;
    }
    return await ctx.db.insert("typingIndicators", {
      user: ctx.user._id,
      dmOrChannelId,
      expireAt,
    });
  },
});
export const remove = internalMutation({
  args: {
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
    user: v.id("users"),
    expireAt: v.optional(v.number()),
  },
  handler: async (ctx, { dmOrChannelId, user, expireAt }) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_dmOrChannelId", (q) =>
        q.eq("user", user).eq("dmOrChannelId", dmOrChannelId)
      )
      .unique();
    if (existing && (!expireAt || existing.expireAt === expireAt)) {
      await ctx.db.delete(existing._id);
    }
  },
});
