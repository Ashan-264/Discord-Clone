import { v } from "convex/values";
import { authenticatedMutation } from "./helpers";

export const remove = authenticatedMutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    await ctx.storage.delete(storageId);
    return url;
  },
});
