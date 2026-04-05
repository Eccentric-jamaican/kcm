import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// Helper to get start/end of year/month for range queries
function getYearRange(year: number): { start: number; end: number } {
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  return { start, end };
}

function getMonthRange(year: number, month: number): { start: number; end: number } {
  // month is 1-indexed (1 = January)
  const start = new Date(year, month - 1, 1).getTime();
  const end = new Date(year, month, 1).getTime();
  return { start, end };
}

export const listWebinars = query({
  args: {
    paginationOpts: paginationOptsValidator,
    year: v.optional(v.number()),
    month: v.optional(v.number()),
    category: v.optional(v.union(
      v.literal("Weekly Market Review"),
      v.literal("Strategy Sessions"),
      v.literal("Q&A / Ask Me Anything")
    )),
  },
  handler: async (ctx, args) => {
    // Build query based on filters
    const category = args.category;
    if (category) {
      // Category filter with optional date range
      const baseQuery = ctx.db
        .query("webinars")
        .withIndex("by_category_date", (q) => q.eq("category", category));

      if (args.year !== undefined && args.month !== undefined) {
        const { start, end } = getMonthRange(args.year, args.month);
        return await baseQuery
          .filter((q) =>
            q.and(q.gte(q.field("date"), start), q.lt(q.field("date"), end))
          )
          .order("desc")
          .paginate(args.paginationOpts);
      }

      if (args.year !== undefined) {
        const { start, end } = getYearRange(args.year);
        return await baseQuery
          .filter((q) =>
            q.and(q.gte(q.field("date"), start), q.lt(q.field("date"), end))
          )
          .order("desc")
          .paginate(args.paginationOpts);
      }

      return await baseQuery.order("desc").paginate(args.paginationOpts);
    }

    // No category filter - use date index
    const baseQuery = ctx.db.query("webinars").withIndex("by_date");

    if (args.year !== undefined && args.month !== undefined) {
      const { start, end } = getMonthRange(args.year, args.month);
      return await baseQuery
        .filter((q) =>
          q.and(q.gte(q.field("date"), start), q.lt(q.field("date"), end))
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    if (args.year !== undefined) {
      const { start, end } = getYearRange(args.year);
      return await baseQuery
        .filter((q) =>
          q.and(q.gte(q.field("date"), start), q.lt(q.field("date"), end))
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await baseQuery.order("desc").paginate(args.paginationOpts);
  },
});

export const getWebinarById = query({
  args: {
    id: v.id("webinars"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all available years for the filter dropdown
export const getAvailableYears = query({
  args: {},
  handler: async (ctx) => {
    const webinars = await ctx.db
      .query("webinars")
      .withIndex("by_date")
      .order("desc")
      .take(100);

    const years = new Set<number>();
    for (const webinar of webinars) {
      const year = new Date(webinar.date).getFullYear();
      years.add(year);
    }

    return Array.from(years).sort((a, b) => b - a); // Descending
  },
});

// Get months that have webinars for a specific year
export const getAvailableMonthsForYear = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const { start, end } = getYearRange(args.year);

    const webinars = await ctx.db
      .query("webinars")
      .withIndex("by_date")
      .filter((q) =>
        q.and(q.gte(q.field("date"), start), q.lt(q.field("date"), end))
      )
      .take(100);

    const months = new Set<number>();
    for (const webinar of webinars) {
      const month = new Date(webinar.date).getMonth() + 1; // 1-indexed
      months.add(month);
    }

    return Array.from(months).sort((a, b) => a - b); // Ascending
  },
});
