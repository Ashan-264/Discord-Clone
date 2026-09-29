import Groq from "groq-sdk";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const run = internalAction({
  args: { id: v.id("messages") },
  handler: async (ctx, { id }) => {
    const message = await ctx.runQuery(
      internal.functions.moderation.getMessage,
      {
        id,
      }
    );
    if (!message) return;
    const result = await groq.chat.completions.create({
      model: "meta-llama/Llama-Guard-4-12B",
      messages: [
        {
          role: "user",
          content: message.content,
        },
      ],
    });
    const value = result.choices[0]?.message?.content;

    if (value?.startsWith("unsafe")) {
      await ctx.runMutation(internal.functions.moderation.deleteMessage, {
        id,
        reason: value.replace("unsafe", "").trim(),
      });
    }
  },
});

const reasons: Record<string, string> = {
  S1: "Violent Crimes",
  S2: "Non-Violent Crimes",
  S3: "Sex-Related Crimes",
  S4: "Child Sexual Exploitation",
  S5: "Defamation",
  S6: "Specialized Advice",
  S7: "Privacy",
  S8: "Intellectual Property",
  S9: "Indiscriminate Weapons",
  S10: "Hate",
  S11: "Suicide & Self-Harm",
  S12: "Sexual Content",
  S13: "Elections",
  S14: "Code Interpreter Abuse",
};

// Llama Guard reports one or more category codes, e.g. "S2" or "S1,S10".
// Look each one up individually so a multi-category verdict doesn't fall through
// to an unmatched key and lose the reason entirely.
const describeReason = (reason: string | undefined) => {
  if (!reason) return undefined;
  const described = reason
    .split(/[,\s]+/)
    .map((code) => reasons[code.trim()])
    .filter((label): label is string => Boolean(label));
  return described.length > 0 ? described.join(", ") : undefined;
};

export const deleteMessage = internalMutation({
  args: {
    id: v.id("messages"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, reason }) => {
    return await ctx.db.patch(id, {
      deleted: true,
      deletedReason: describeReason(reason),
    });
  },
});

export const getMessage = internalQuery({
  args: { id: v.id("messages") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
