import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// Helper to get start/end of year/month for range queries (UTC)
function getYearRange(year: number): { start: number; end: number } {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  return { start, end };
}

function getMonthRange(year: number, month: number): { start: number; end: number } {
  // month is 1-indexed (1 = January)
  const start = Date.UTC(year, month - 1, 1);
  const end = Date.UTC(year, month, 1);
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
    // Validate year is an integer in valid range if provided
    if (args.year !== undefined) {
      if (!Number.isInteger(args.year) || args.year < 2020 || args.year > 2100) {
        throw new Error("Year must be an integer between 2020 and 2100");
      }
    }

    // Validate month is an integer in valid range if provided
    if (args.month !== undefined) {
      if (!Number.isInteger(args.month) || args.month < 1 || args.month > 12) {
        throw new Error("Month must be an integer between 1 and 12");
      }
    }

    // Fail-fast: month cannot be provided without year
    if (args.month !== undefined && args.year === undefined) {
      throw new Error("Month filter requires a year to be specified");
    }

    // Build query based on filters
    const category = args.category;
    if (category) {
      // Category filter with optional date range
      if (args.year !== undefined && args.month !== undefined) {
        const { start, end } = getMonthRange(args.year, args.month);
        return await ctx.db
          .query("webinars")
          .withIndex("by_category_date", (q) =>
            q.eq("category", category).gte("date", start).lt("date", end)
          )
          .order("desc")
          .paginate(args.paginationOpts);
      }

      if (args.year !== undefined) {
        const { start, end } = getYearRange(args.year);
        return await ctx.db
          .query("webinars")
          .withIndex("by_category_date", (q) =>
            q.eq("category", category).gte("date", start).lt("date", end)
          )
          .order("desc")
          .paginate(args.paginationOpts);
      }

      return await ctx.db
        .query("webinars")
        .withIndex("by_category_date", (q) => q.eq("category", category))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // No category filter - use date index
    if (args.year !== undefined && args.month !== undefined) {
      const { start, end } = getMonthRange(args.year, args.month);
      return await ctx.db
        .query("webinars")
        .withIndex("by_date", (q) => q.gte("date", start).lt("date", end))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    if (args.year !== undefined) {
      const { start, end } = getYearRange(args.year);
      return await ctx.db
        .query("webinars")
        .withIndex("by_date", (q) => q.gte("date", start).lt("date", end))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("webinars")
      .withIndex("by_date")
      .order("desc")
      .paginate(args.paginationOpts);
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
      .collect();

    const years = new Set<number>();
    for (const webinar of webinars) {
      const year = new Date(webinar.date).getUTCFullYear();
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
    // Validate year is an integer in valid range (same as listWebinars)
    if (!Number.isInteger(args.year) || args.year < 2020 || args.year > 2100) {
      throw new Error("Year must be an integer between 2020 and 2100");
    }

    const { start, end } = getYearRange(args.year);

    const webinars = await ctx.db
      .query("webinars")
      .withIndex("by_date", (q) => q.gte("date", start).lt("date", end))
      .collect();

    const months = new Set<number>();
    for (const webinar of webinars) {
      const month = new Date(webinar.date).getUTCMonth() + 1; // 1-indexed
      months.add(month);
    }

    return Array.from(months).sort((a, b) => a - b); // Ascending
  },
});
