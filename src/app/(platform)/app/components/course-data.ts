export type CourseLevel = "Beginner" | "Intermediate" | "Advanced" | "All Levels"

export type CourseChapter = {
  id: string
  title: string
  duration: string
}

export type Course = {
  id: string
  title: string
  description: string
  subtitle: string
  chapters: number
  duration: string
  level: CourseLevel
  tags: string[]
  imageUrl: string
  chapterList: CourseChapter[]
}

export type ContinueLearningCourse = {
  courseId: string
  currentChapter: string
  progress: number
  completedChapters: number
  totalChapters: number
}

export const courseCatalog: Course[] = [
  {
    id: "1",
    title: "Forex Trading Fundamentals",
    description:
      "Build a solid foundation in currency markets, lot sizing, pips, and disciplined setup execution.",
    subtitle: "Master high-probability forex execution fundamentals.",
    chapters: 12,
    duration: "8 hours",
    level: "Beginner",
    tags: ["Forex", "Trading Basics"],
    imageUrl:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1772728477/workshops/workshop~14636e/fa600f97-6cf2-4759-8641-3093d13591bf-6rrk6b?_a=BAVAZGAQ0",
    chapterList: [
      { id: "1-1", title: "Market Sessions and Liquidity", duration: "22 min" },
      { id: "1-2", title: "Pairs, Pips, and Position Size", duration: "31 min" },
      { id: "1-3", title: "Reading Candles with Context", duration: "28 min" },
      { id: "1-4", title: "Building a Repeatable Setup", duration: "35 min" },
    ],
  },
  {
    id: "2",
    title: "Advanced Price Action Analysis",
    description:
      "Learn to read structure shifts, liquidity sweeps, and high-probability continuation patterns.",
    subtitle: "Read structure, momentum, and liquidity with confidence.",
    chapters: 15,
    duration: "12 hours",
    level: "Advanced",
    tags: ["Price Action", "Technical Analysis"],
    imageUrl:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1768309978/workshops/workshop_6lw0i/57a97191-e92c-442d-a56d-218542c56c95-lr3qgo?_a=BAVAZGAQ0",
    chapterList: [
      { id: "2-1", title: "Market Structure Mapping", duration: "34 min" },
      { id: "2-2", title: "Premium and Discount Zones", duration: "29 min" },
      { id: "2-3", title: "Sweep and Reclaim Setups", duration: "33 min" },
      { id: "2-4", title: "High-Timeframe Confluence", duration: "41 min" },
    ],
  },
  {
    id: "3",
    title: "Risk Management Mastery",
    description:
      "Protect capital and optimize growth with practical risk models and drawdown controls.",
    subtitle: "Build durable risk systems for consistency over time.",
    chapters: 8,
    duration: "6 hours",
    level: "Intermediate",
    tags: ["Risk Management", "Position Sizing"],
    imageUrl:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1768990765/workshops/workshop_ziqgw/7696b4d9-c2fe-4436-a4f6-c4cf83661223-6rrk66?_a=BAVAZGAQ0",
    chapterList: [
      { id: "3-1", title: "Defining Risk Per Trade", duration: "21 min" },
      { id: "3-2", title: "R-Multiple Thinking", duration: "24 min" },
      { id: "3-3", title: "Reducing Emotional Overexposure", duration: "27 min" },
      { id: "3-4", title: "Weekly Risk Review Framework", duration: "25 min" },
    ],
  },
  {
    id: "4",
    title: "Trading Psychology Edge",
    description:
      "Strengthen consistency by improving execution discipline, emotional control, and journaling.",
    subtitle: "Train your mindset for repeatable, disciplined execution.",
    chapters: 10,
    duration: "7 hours",
    level: "All Levels",
    tags: ["Psychology", "Mindset"],
    imageUrl:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1768990496/workshops/workshop_w8nx7/7719234a-5290-48f9-80e3-5d1a38951698-1j?_a=BAVAZGAQ0",
    chapterList: [
      { id: "4-1", title: "Bias Control Before Session Open", duration: "18 min" },
      { id: "4-2", title: "Decision Hygiene and Triggers", duration: "26 min" },
      { id: "4-3", title: "Post-Loss Recovery Protocol", duration: "23 min" },
      { id: "4-4", title: "Building a Personal Trade Journal", duration: "28 min" },
    ],
  },
  {
    id: "5",
    title: "ICT Concepts Simplified",
    description:
      "Apply core ICT concepts in a clear, structured way without overcomplicating execution.",
    subtitle: "Translate smart-money concepts into practical entries.",
    chapters: 20,
    duration: "18 hours",
    level: "Advanced",
    tags: ["ICT", "Smart Money"],
    imageUrl:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1768989921/workshops/workshop_ja7rw/echo?_a=BAVAZGAQ0",
    chapterList: [
      { id: "5-1", title: "Liquidity Pools and Draw on Liquidity", duration: "37 min" },
      { id: "5-2", title: "Order Blocks and Mitigation", duration: "33 min" },
      { id: "5-3", title: "Fair Value Gap Workflow", duration: "35 min" },
      { id: "5-4", title: "Session Model Execution Plan", duration: "39 min" },
    ],
  },
  {
    id: "6",
    title: "Building Your Trading Plan",
    description:
      "Turn your strategy into a documented process with routines, KPIs, and accountability loops.",
    subtitle: "Create a complete plan you can execute every session.",
    chapters: 6,
    duration: "4 hours",
    level: "Beginner",
    tags: ["Trading Plan", "Goal Setting"],
    imageUrl:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1770404355/maxresdefault_gtfhoz?_a=BAVAZGAQ0",
    chapterList: [
      { id: "6-1", title: "Defining Personal Trading Rules", duration: "20 min" },
      { id: "6-2", title: "Session Checklist Design", duration: "19 min" },
      { id: "6-3", title: "Weekly KPI Scorecard", duration: "23 min" },
      { id: "6-4", title: "Execution Feedback Cycle", duration: "18 min" },
    ],
  },
]

export const continueLearningCourses: ContinueLearningCourse[] = [
  {
    courseId: "1",
    currentChapter: "Chapter 3: Reading Candles with Context",
    progress: 35,
    completedChapters: 4,
    totalChapters: 12,
  },
  {
    courseId: "2",
    currentChapter: "Chapter 7: Premium and Discount Zones",
    progress: 58,
    completedChapters: 8,
    totalChapters: 15,
  },
]

export function getCourseById(courseId: string) {
  return courseCatalog.find((course) => course.id === courseId)
}
