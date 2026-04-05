import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Sample webinar data
const sampleWebinars = [
  {
    title: "USD/JPY Breakout Analysis - January 2025",
    description:
      "In-depth analysis of the USD/JPY breakout patterns, key support and resistance levels, and trading opportunities for the upcoming week. We covered entry signals, risk management, and profit targets.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800&q=80",
    presenter: "KCM Team",
    duration: 45,
    date: new Date("2025-01-15T18:00:00Z").getTime(),
    category: "Weekly Market Review" as const,
    tags: ["USD/JPY", "Forex", "Breakout", "Technical Analysis"],
  },
  {
    title: "ICT Fair Value Gap Strategy Explained",
    description:
      "A comprehensive breakdown of the Fair Value Gap concept from ICT. Learn how to identify valid FVGs, when to enter, and how to manage trades using this powerful smart money concept.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
    presenter: "Antonio",
    duration: 62,
    date: new Date("2025-02-03T19:00:00Z").getTime(),
    category: "Strategy Sessions" as const,
    tags: ["ICT", "Fair Value Gap", "Smart Money", "Advanced"],
  },
  {
    title: "Live Q&A: Your Trading Questions Answered",
    description:
      "An interactive session where we answered your most pressing trading questions. Topics included psychology, risk management, strategy selection, and building a trading plan.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80",
    presenter: "Antonio",
    duration: 78,
    date: new Date("2025-02-20T17:00:00Z").getTime(),
    category: "Q&A / Ask Me Anything" as const,
    tags: ["Q&A", "Psychology", "Risk Management", "Beginner"],
  },
  {
    title: "Gold & Silver Weekly Outlook - December 2024",
    description:
      "Technical and fundamental analysis of precious metals. We discussed the impact of Federal Reserve policy, dollar strength, and key price levels for XAU/USD and XAG/USD.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    presenter: "KCM Team",
    duration: 52,
    date: new Date("2024-12-10T18:00:00Z").getTime(),
    category: "Weekly Market Review" as const,
    tags: ["Gold", "Silver", "XAU/USD", "Commodities"],
  },
  {
    title: "Risk Management Workshop: Protecting Your Capital",
    description:
      "A deep dive into professional risk management techniques. Topics included position sizing, R-multiples, drawdown control, and creating a personalized risk framework.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    presenter: "Antonio",
    duration: 55,
    date: new Date("2024-11-15T19:00:00Z").getTime(),
    category: "Strategy Sessions" as const,
    tags: ["Risk Management", "Position Sizing", "Capital Protection"],
  },
  {
    title: "Beginner Trading Mistakes & How to Avoid Them",
    description:
      "We covered the most common mistakes new traders make and provided actionable strategies to overcome them. From overtrading to revenge trading, learn how to build good habits early.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    presenter: "Antonio",
    duration: 48,
    date: new Date("2024-10-28T17:00:00Z").getTime(),
    category: "Q&A / Ask Me Anything" as const,
    tags: ["Beginner", "Mistakes", "Psychology", "Discipline"],
  },
];

export const seedWebinars = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if webinars already exist
    const existing = await ctx.db.query("webinars").take(1);
    if (existing.length > 0) {
      console.log("Webinars already seeded, skipping...");
      return { seeded: false, message: "Webinars already exist" };
    }

    // Insert sample webinars
    for (const webinar of sampleWebinars) {
      await ctx.db.insert("webinars", webinar);
    }

    console.log(`Seeded ${sampleWebinars.length} webinars`);
    return { seeded: true, count: sampleWebinars.length };
  },
});
