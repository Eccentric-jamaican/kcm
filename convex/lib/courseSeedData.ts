export type SeedCourse = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  body: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  tags: string[];
  coverImageUrl: string;
  estimatedDurationMinutes: number;
  lessons: Array<{
    slug: string;
    title: string;
    description: string;
    body: string;
    durationMinutes: number;
  }>;
};

function makeLessonBody(title: string, description: string, durationMinutes: number) {
  return [
    `00:00 ${title}`,
    `00:18 ${description}`,
    `00:42 This lesson is part of the KCM migration seed and is ready to be replaced with your real video, transcript, and resources.`,
    `01:10 Suggested runtime: ${durationMinutes} minutes.`,
  ].join("\n\n");
}

export const seedCourses: SeedCourse[] = [
  {
    slug: "forex-trading-fundamentals",
    title: "Forex Trading Fundamentals",
    subtitle: "Master high-probability forex execution fundamentals.",
    description: "Build a solid foundation in currency markets, lot sizing, pips, and disciplined setup execution.",
    body: "Learn the language of the market, the structure of sessions, and the execution habits that keep you consistent.",
    level: "Beginner",
    tags: ["Forex", "Trading Basics"],
    coverImageUrl: "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1772728477/workshops/workshop~14636e/fa600f97-6cf2-4759-8641-3093d13591bf-6rrk6b?_a=BAVAZGAQ0",
    estimatedDurationMinutes: 480,
    lessons: [
      { slug: "market-sessions-and-liquidity", title: "Market Sessions and Liquidity", description: "Understand when liquidity enters the market and why session timing matters.", body: makeLessonBody("Market Sessions and Liquidity", "Understand when liquidity enters the market and why session timing matters.", 22), durationMinutes: 22 },
      { slug: "pairs-pips-and-position-size", title: "Pairs, Pips, and Position Size", description: "Break down the maths behind position sizing and risk exposure.", body: makeLessonBody("Pairs, Pips, and Position Size", "Break down the maths behind position sizing and risk exposure.", 31), durationMinutes: 31 },
      { slug: "reading-candles-with-context", title: "Reading Candles with Context", description: "Translate candle movement into market intent instead of noise.", body: makeLessonBody("Reading Candles with Context", "Translate candle movement into market intent instead of noise.", 28), durationMinutes: 28 },
      { slug: "building-a-repeatable-setup", title: "Building a Repeatable Setup", description: "Turn concepts into a repeatable checklist-driven trade setup.", body: makeLessonBody("Building a Repeatable Setup", "Turn concepts into a repeatable checklist-driven trade setup.", 35), durationMinutes: 35 },
    ],
  },
  {
    slug: "advanced-price-action-analysis",
    title: "Advanced Price Action Analysis",
    subtitle: "Read structure, momentum, and liquidity with confidence.",
    description: "Learn to read structure shifts, liquidity sweeps, and high-probability continuation patterns.",
    body: "This course focuses on seeing clean structure, framing setups with higher-timeframe context, and executing with patience.",
    level: "Advanced",
    tags: ["Price Action", "Technical Analysis"],
    coverImageUrl: "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1768309978/workshops/workshop_6lw0i/57a97191-e92c-442d-a56d-218542c56c95-lr3qgo?_a=BAVAZGAQ0",
    estimatedDurationMinutes: 720,
    lessons: [
      { slug: "market-structure-mapping", title: "Market Structure Mapping", description: "Map swings, breaks, and shifts with a repeatable structure framework.", body: makeLessonBody("Market Structure Mapping", "Map swings, breaks, and shifts with a repeatable structure framework.", 34), durationMinutes: 34 },
      { slug: "premium-and-discount-zones", title: "Premium and Discount Zones", description: "Use pricing context to frame cleaner entries and exits.", body: makeLessonBody("Premium and Discount Zones", "Use pricing context to frame cleaner entries and exits.", 29), durationMinutes: 29 },
      { slug: "sweep-and-reclaim-setups", title: "Sweep and Reclaim Setups", description: "Identify liquidity grabs and fast reclaim opportunities.", body: makeLessonBody("Sweep and Reclaim Setups", "Identify liquidity grabs and fast reclaim opportunities.", 33), durationMinutes: 33 },
      { slug: "high-timeframe-confluence", title: "High-Timeframe Confluence", description: "Stack confluence from higher timeframes without overcomplicating the chart.", body: makeLessonBody("High-Timeframe Confluence", "Stack confluence from higher timeframes without overcomplicating the chart.", 41), durationMinutes: 41 },
    ],
  },
  {
    slug: "risk-management-mastery",
    title: "Risk Management Mastery",
    subtitle: "Build durable risk systems for consistency over time.",
    description: "Protect capital and optimize growth with practical risk models and drawdown controls.",
    body: "A practical course on preserving capital, choosing smart exposure, and building a framework you can trust through volatility.",
    level: "Intermediate",
    tags: ["Risk Management", "Position Sizing"],
    coverImageUrl: "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1768990765/workshops/workshop_ziqgw/7696b4d9-c2fe-4436-a4f6-c4cf83661223-6rrk66?_a=BAVAZGAQ0",
    estimatedDurationMinutes: 360,
    lessons: [
      { slug: "defining-risk-per-trade", title: "Defining Risk Per Trade", description: "Choose the right amount of capital to put at risk on every setup.", body: makeLessonBody("Defining Risk Per Trade", "Choose the right amount of capital to put at risk on every setup.", 21), durationMinutes: 21 },
      { slug: "r-multiple-thinking", title: "R-Multiple Thinking", description: "Measure performance with risk-normalized outcomes.", body: makeLessonBody("R-Multiple Thinking", "Measure performance with risk-normalized outcomes.", 24), durationMinutes: 24 },
      { slug: "reducing-emotional-overexposure", title: "Reducing Emotional Overexposure", description: "Lower stress by reducing oversized and undisciplined positions.", body: makeLessonBody("Reducing Emotional Overexposure", "Lower stress by reducing oversized and undisciplined positions.", 27), durationMinutes: 27 },
      { slug: "weekly-risk-review-framework", title: "Weekly Risk Review Framework", description: "Audit exposure, drawdown, and discipline on a fixed weekly cadence.", body: makeLessonBody("Weekly Risk Review Framework", "Audit exposure, drawdown, and discipline on a fixed weekly cadence.", 25), durationMinutes: 25 },
    ],
  },
];
