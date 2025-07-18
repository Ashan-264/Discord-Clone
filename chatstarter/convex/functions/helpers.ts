import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query, QueryCtx } from "../_generated/server";
import { getCurrentUser } from "./user";
import { Doc, Id } from "../_generated/dataModel";

export interface AuthenticatedQueryCtx extends QueryCtx {
  user: Doc<"users">;
}

export const authenticatedQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    return { user };
  })
);

export const authenticatedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    return { user };
  })
);

export const assertServerOwner = async (
  ctx: AuthenticatedQueryCtx,
  serverId: Id<"servers">
) => {
  const server = await ctx.db.get(serverId);
  if (!server) {
    throw new Error("Server not found");
  }
  if (server.ownerId !== ctx.user._id) {
    throw new Error("You are not the owner of this server");
  }
};

export const assertServerMember = async (
  ctx: AuthenticatedQueryCtx,
  serverId: Id<"servers">
) => {
  const serverMember = await ctx.db
    .query("serverMembers")
    .withIndex("by_serverId_userId", (q) =>
      q.eq("serverId", serverId).eq("userId", ctx.user._id)
    )
    .unique();

  if (!serverMember) {
    throw new Error("You are not a member of this server");
  }
};

export const assertChannelMember = async (
  ctx: AuthenticatedQueryCtx,
  dmOrChannelId: Id<"directMessages" | "channels">
) => {
  const dmOrChannel = await ctx.db.get(dmOrChannelId);
  if (!dmOrChannel) {
    throw new Error("DM or channel not found");
  } else if ("serverId" in dmOrChannel) {
    //this is a channel
    const serverMember = await ctx.db
      .query("serverMembers")
      .withIndex("by_serverId_userId", (q) =>
        q.eq("serverId", dmOrChannel.serverId).eq("userId", ctx.user._id)
      )
      .unique();
    if (!serverMember) {
      throw new Error("You are not a member of this server");
    }
  } else {
    //this is  a direct messagw
    const directMessageMember = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_user", (q) =>
        q.eq("directMessage", dmOrChannel._id).eq("user", ctx.user._id)
      )
      .unique();
    if (!directMessageMember) {
      throw new Error("You are not a member of this Direct Message");
    }
  }
};
