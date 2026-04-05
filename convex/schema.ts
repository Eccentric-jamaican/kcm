import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkSubject: v.string(),
    email: v.union(v.string(), v.null()),
    name: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
    onboardingCompleted: v.boolean(),
    onboardingInterests: v.array(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
