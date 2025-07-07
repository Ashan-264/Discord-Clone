import {
  internalMutation,
  MutationCtx,
  query,
  QueryCtx,
  mutation,
} from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const get = query({
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsert = internalMutation({
  args: {
    username: v.string(),
    image: v.string(),
    clerkId: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);

    if (user) {
      await ctx.db.patch(user._id, {
        username: args.username,
        image: args.image,
        email: args.email,
      });
    } else {
      // Set the first user with email ash474d@gmail.com as admin
      const isAdmin = args.email === "ash474d@gmail.com";
      await ctx.db.insert("users", {
        username: args.username,
        image: args.image,
        clerkId: args.clerkId,
        email: args.email,
        role: isAdmin ? "admin" : "user",
        isPrivate: false, // Default to public
      });
    }
  },
});

export const remove = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await getUserByClerkId(ctx, clerkId);
    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const getCurrentUser = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return await getUserByClerkId(ctx, identity.subject);
};

const getUserByClerkId = async (
  ctx: QueryCtx | MutationCtx,
  clerkId: string
) => {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
};

export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const isAdmin = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user?.role === "admin";
  },
});

export const sendDirectMessage = mutation({
  args: {
    targetUserId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, { targetUserId, content }) => {
    const adminUser = await getCurrentUser(ctx);
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Check if DM already exists between admin and target user
    const existingDMs = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_user", (q) => q.eq("user", adminUser._id))
      .collect();

    let dm: Id<"directMessages"> | null = null;

    for (const dmMember of existingDMs) {
      const otherMembers = await ctx.db
        .query("directMessageMembers")
        .withIndex("by_direct_message", (q) =>
          q.eq("directMessage", dmMember.directMessage)
        )
        .collect();

      if (
        otherMembers.length === 2 &&
        otherMembers.some((m) => m.user === targetUserId)
      ) {
        dm = dmMember.directMessage;
        break;
      }
    }

    // Create new DM if none exists
    if (!dm) {
      dm = await ctx.db.insert("directMessages", {});

      await ctx.db.insert("directMessageMembers", {
        directMessage: dm,
        user: adminUser._id,
      });

      await ctx.db.insert("directMessageMembers", {
        directMessage: dm,
        user: targetUserId,
      });
    }

    // Send the message
    await ctx.db.insert("messages", {
      sender: adminUser._id,
      content,
      dmOrChannelId: dm,
    });
  },
});

export const updateUserEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      email: email,
    });

    // Set admin role if email matches
    if (email === "ash474d@gmail.com" && user.role !== "admin") {
      await ctx.db.patch(user._id, {
        role: "admin",
      });
    }
  },
});

export const syncCurrentUserEmail = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found in database");
    }

    // Get email from Clerk JWT identity
    const email = identity.email;
    if (!email) {
      throw new Error("No email found in Clerk JWT identity");
    }

    await ctx.db.patch(user._id, {
      email: email,
    });

    // Set admin role if email matches
    if (email === "ash474d@gmail.com" && user.role !== "admin") {
      await ctx.db.patch(user._id, {
        role: "admin",
      });
    }

    return email;
  },
});

export const migrateUserEmails = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let updatedCount = 0;

    for (const user of users) {
      // Try to get user identity from Clerk
      // Note: This is a simplified approach - in production you'd want to use Clerk's API
      // For now, we'll just update the admin user if they exist
      if (user.clerkId) {
        // Check if this user should be admin based on existing data or patterns
        // This is a fallback for existing users
        if (!user.role && user.email === "ash474d@gmail.com") {
          await ctx.db.patch(user._id, {
            role: "admin",
          });
          updatedCount++;
        }
      }
    }

    return { updatedCount, totalUsers: users.length };
  },
});

export const syncAllUserEmails = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let updatedCount = 0;
    let adminCount = 0;

    for (const user of users) {
      try {
        // Check if user has a clerkId but no email
        if (user.clerkId && !user.email) {
          // For now, we'll set a placeholder and let the webhook handle it
          // In a real implementation, you'd use Clerk's API to get user data
          await ctx.db.patch(user._id, {
            email: `user-${user.clerkId.slice(0, 8)}@placeholder.com`,
          });
          updatedCount++;
        }

        // Set admin role for users with ash474d@gmail.com email
        if (user.email === "ash474d@gmail.com" && user.role !== "admin") {
          await ctx.db.patch(user._id, {
            role: "admin",
          });
          adminCount++;
        }
      } catch (error) {
        console.error(`Failed to update user ${user._id}:`, error);
      }
    }

    return {
      updatedCount,
      adminCount,
      totalUsers: users.length,
      message: `Updated ${updatedCount} users, set ${adminCount} as admin`,
    };
  },
});

export const forceUpdateUserEmail = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { clerkId, email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      email: email,
    });

    // Set admin role if email matches
    if (email === "ash474d@gmail.com" && user.role !== "admin") {
      await ctx.db.patch(user._id, {
        role: "admin",
      });
    }

    return { success: true, userId: user._id, email, role: user.role };
  },
});

export const syncAllUserEmailsFromClerk = mutation({
  handler: async (ctx) => {
    const adminUser = await getCurrentUser(ctx);
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    let updatedCount = 0;
    let adminCount = 0;

    for (const user of users) {
      try {
        // Use Clerk's API to get user data
        const response = await fetch(
          `https://api.clerk.com/v1/users/${user.clerkId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const clerkUser = await response.json();
          const email = clerkUser.email_addresses?.[0]?.email_address;

          if (email && email !== user.email) {
            await ctx.db.patch(user._id, {
              email: email,
            });
            updatedCount++;

            // Set admin role if email matches
            if (email === "ash474d@gmail.com" && user.role !== "admin") {
              await ctx.db.patch(user._id, {
                role: "admin",
              });
              adminCount++;
            }
          }
        }
      } catch (error) {
        console.error(`Failed to update user ${user._id}:`, error);
      }
    }

    return {
      updatedCount,
      adminCount,
      totalUsers: users.length,
      message: `Updated ${updatedCount} users, set ${adminCount} as admin`,
    };
  },
});

export const syncAllUserEmailsSimple = mutation({
  handler: async (ctx) => {
    const adminUser = await getCurrentUser(ctx);
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    let updatedCount = 0;
    let adminCount = 0;

    for (const user of users) {
      try {
        // For users without emails, set a placeholder
        if (!user.email) {
          await ctx.db.patch(user._id, {
            email: `user-${user.clerkId.slice(0, 8)}@placeholder.com`,
          });
          updatedCount++;
        }

        // Set admin role for users with ash474d@gmail.com email
        if (user.email === "ash474d@gmail.com" && user.role !== "admin") {
          await ctx.db.patch(user._id, {
            role: "admin",
          });
          adminCount++;
        }
      } catch (error) {
        console.error(`Failed to update user ${user._id}:`, error);
      }
    }

    return {
      updatedCount,
      adminCount,
      totalUsers: users.length,
      message: `Updated ${updatedCount} users with placeholder emails, set ${adminCount} as admin`,
    };
  },
});

export const syncAllUserEmailsFromJWT = mutation({
  handler: async (ctx) => {
    const adminUser = await getCurrentUser(ctx);
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    let updatedCount = 0;
    let adminCount = 0;

    // Get current user's email from JWT to use as reference
    const identity = await ctx.auth.getUserIdentity();
    const currentEmail = identity?.email;

    for (const user of users) {
      try {
        // For users without emails, we'll need to get their email from Clerk
        // Since we can't access other users' JWT tokens, we'll use a different approach

        // Check if this is the current user and they don't have an email
        if (user._id === adminUser._id && !user.email && currentEmail) {
          await ctx.db.patch(user._id, {
            email: currentEmail,
          });
          updatedCount++;

          // Set admin role if email matches
          if (currentEmail === "ash474d@gmail.com" && user.role !== "admin") {
            await ctx.db.patch(user._id, {
              role: "admin",
            });
            adminCount++;
          }
        }
        // For other users, we'll need to manually set their emails
        // This is a limitation - we can't access other users' JWT tokens
        else if (!user.email) {
          // For now, we'll set a more descriptive placeholder
          await ctx.db.patch(user._id, {
            email: `user-${user.clerkId.slice(0, 8)}@needs-sync.com`,
          });
          updatedCount++;
        }
      } catch (error) {
        console.error(`Failed to update user ${user._id}:`, error);
      }
    }

    return {
      updatedCount,
      adminCount,
      totalUsers: users.length,
      message: `Updated ${updatedCount} users. Note: Only current user's email was synced from JWT. Other users need manual email entry.`,
    };
  },
});

export const setUserEmail = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, { userId, email }) => {
    const adminUser = await getCurrentUser(ctx);
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      email: email,
    });

    // Set admin role if email matches
    if (email === "ash474d@gmail.com" && user.role !== "admin") {
      await ctx.db.patch(userId, {
        role: "admin",
      });
    }

    return { success: true, userId, email, role: user.role };
  },
});

export const setPrivacy = mutation({
  args: {
    isPrivate: v.boolean(),
  },
  handler: async (ctx, { isPrivate }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      isPrivate: isPrivate,
    });

    return { success: true, isPrivate };
  },
});

export const getPublicUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_privacy", (q) => q.eq("isPrivate", false))
      .collect();

    return users.filter((user) => user !== null);
  },
});

export const getPrivateUsers = query({
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const users = await ctx.db
      .query("users")
      .withIndex("by_privacy", (q) => q.eq("isPrivate", true))
      .collect();

    return users.filter((user) => user !== null);
  },
});

export const getAllPublicUsers = query({
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      return [];
    }

    // Get all users that are either public or the current user
    const publicUsers = await ctx.db
      .query("users")
      .withIndex("by_privacy", (q) => q.eq("isPrivate", false))
      .collect();

    const currentUserData = await ctx.db.get(currentUser._id);

    // Include current user even if private
    const allUsers = [...publicUsers];
    if (
      currentUserData &&
      !allUsers.find((u) => u._id === currentUserData._id)
    ) {
      allUsers.push(currentUserData);
    }

    return allUsers.filter((user) => user !== null);
  },
});
