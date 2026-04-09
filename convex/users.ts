import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireIdentity, requireViewer, roleValidator } from "./lib/auth";

function getDisplayName(identity: Awaited<ReturnType<typeof requireIdentity>>) {
  return identity.name ?? identity.preferredUsername ?? identity.nickname ?? null;
}

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await requireViewer(ctx);

    return {
      ...viewer.user,
      role: viewer.role,
      isAdmin: viewer.isAdmin,
      isMaintainer: viewer.isMaintainer,
    };
  },
});

export const upsertCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    const profile = {
      clerkSubject: identity.subject,
      email: identity.email ?? null,
      name: getDisplayName(identity),
      imageUrl: identity.pictureUrl ?? null,
    };

    if (existingUser) {
      await ctx.db.patch(existingUser._id, profile);
      return await ctx.db.get(existingUser._id);
    }

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      onboardingCompleted: false,
      onboardingInterests: [],
      role: "student",
      ...profile,
    });

    return await ctx.db.get(userId);
  },
});

export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { role: args.role });
    return await ctx.db.get(args.userId);
  },
});
