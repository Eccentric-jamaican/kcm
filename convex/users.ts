import type { QueryCtx, MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

function getDisplayName(identity: Awaited<ReturnType<QueryCtx["auth"]["getUserIdentity"]>>) {
  if (!identity) {
    return null;
  }

  return identity.name ?? identity.preferredUsername ?? identity.nickname ?? null;
}

async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity;
}

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);

    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
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
      ...profile,
    });

    return await ctx.db.get(userId);
  },
});
