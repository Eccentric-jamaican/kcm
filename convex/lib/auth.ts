import { v } from "convex/values";
import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export const roleValidator = v.union(v.literal("student"), v.literal("maintainer"), v.literal("admin"));

type DataCtx = QueryCtx | MutationCtx;
type AnyCtx = QueryCtx | MutationCtx | ActionCtx;

export type ViewerRecord = {
  user: Doc<"users">;
  role: "student" | "maintainer" | "admin";
  isAdmin: boolean;
  isMaintainer: boolean;
};

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

function getBootstrapAdminEmails() {
  return (process.env.COURSE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter((email): email is string => Boolean(email));
}

function getRoleFromUser(user: Doc<"users"> | null) {
  return user?.role ?? "student";
}

function canBootstrapAsAdmin(email: string | null | undefined) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }
  return getBootstrapAdminEmails().includes(normalized);
}

export async function requireIdentity(ctx: AnyCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity;
}

export async function getCurrentUserRecord(ctx: DataCtx) {
  const identity = await requireIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  return { identity, user };
}

export async function requireViewer(ctx: DataCtx): Promise<ViewerRecord> {
  const { identity, user } = await getCurrentUserRecord(ctx);

  if (!user) {
    throw new Error("User profile not found");
  }

  const role = canBootstrapAsAdmin(identity.email) ? "admin" : getRoleFromUser(user);

  return {
    user,
    role,
    isAdmin: role === "admin",
    isMaintainer: role === "maintainer" || role === "admin",
  };
}

export async function requireAdminOrMaintainer(ctx: DataCtx) {
  const viewer = await requireViewer(ctx);

  if (!viewer.isMaintainer) {
    throw new Error("Forbidden");
  }

  return viewer;
}

export async function requireAdmin(ctx: DataCtx) {
  const viewer = await requireViewer(ctx);

  if (!viewer.isAdmin) {
    throw new Error("Forbidden");
  }

  return viewer;
}

export async function assertCanManageCourse(ctx: DataCtx, courseId: Id<"courses">) {
  const viewer = await requireAdminOrMaintainer(ctx);
  const course = await ctx.db.get(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!viewer.isAdmin && course.maintainerUserId !== viewer.user._id) {
    throw new Error("Forbidden");
  }

  return { viewer, course };
}
