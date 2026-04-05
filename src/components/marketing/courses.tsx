import Link from "next/link";
import { Button } from "@/components/ui/button";

// Premium inline SVG icons
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const courses = [
  {
    id: 1,
    title: "Trading Fundamentals",
    description: "Master the basics of trading. Learn market terminology, order types, and essential concepts to build a solid foundation.",
    duration: "8 hours",
    lessons: 24,
    level: "Beginner",
    rating: 4.9,
    students: 850,
    color: "bull",
    image: "/hero-image1.png",
  },
  {
    id: 2,
    title: "Technical Analysis Mastery",
    description: "Deep dive into chart patterns, indicators, and price action strategies used by professional traders worldwide.",
    duration: "12 hours",
    lessons: 36,
    level: "Intermediate",
    rating: 4.8,
    students: 620,
    color: "amber",
    image: "/hero-image2.png",
  },
  {
    id: 3,
    title: "Risk Management Pro",
    description: "Learn to protect your capital. Master position sizing, stop losses, and portfolio management strategies.",
    duration: "6 hours",
    lessons: 18,
    level: "All Levels",
    rating: 4.9,
    students: 740,
    color: "purple",
    image: "/mentor.png",
  },
  {
    id: 4,
    title: "Advanced Strategies",
    description: "Complex trading strategies for experienced traders. Multi-timeframe analysis and advanced pattern recognition.",
    duration: "15 hours",
    lessons: 42,
    level: "Advanced",
    rating: 4.7,
    students: 430,
    color: "bear",
    image: "/hero-image1.png",
  },
];

const getLevelStyle = (level: string) => {
  switch (level) {
    case "Beginner":
      return "bg-bull text-white";
    case "Advanced":
      return "bg-bear text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getButtonColor = (color: string) => {
  switch (color) {
    case "bull":
      return "bg-bull hover:bg-bull/90";
    case "bear":
      return "bg-bear hover:bg-bear/90";
    case "amber":
      return "bg-amber-500 hover:bg-amber-500/90";
    case "purple":
      return "bg-purple-500 hover:bg-purple-500/90";
    default:
      return "bg-foreground hover:bg-foreground/90";
  }
};

export function CoursesSection() {
  return (
    <section
      id="courses"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-bull/5 blur-3xl" />
      </div>
      
      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Premium Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Expert-Curriculum
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Explore Our{" "}
            <span className="text-bull">Courses</span>
          </h2>
          <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Choose from our comprehensive selection of trading courses. Each course is designed 
            to take you from beginner to confident trader.
          </p>
        </div>

        {/* Premium Courses Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Image Section - Takes up half on larger screens */}
                <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:w-1/2">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${course.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                  
                  {/* Level badge - positioned on image */}
                  <div className="absolute left-4 top-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${getLevelStyle(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex w-full flex-col justify-between p-6 lg:w-1/2">
                  {/* Rating & Students */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <StarIcon />
                      <span className="font-bold text-foreground">{course.rating}</span>
                    </div>
                    <span className="text-muted-foreground">{course.students.toLocaleString()} students</span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-xl font-bold leading-tight tracking-tight">
                    {course.title}
                  </h3>

                  {/* Description - Bordered box */}
                  <div className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {course.description}
                    </p>
                  </div>

                  {/* Course Meta */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <ClockIcon />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpenIcon />
                      <span>{course.lessons} lessons</span>
                    </div>
                  </div>

                  {/* CTA Button - Pill shaped */}
                  <Link 
                    href={`https://app.kcmtrades.com/courses/${course.id}`}
                    className={`mt-5 inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 ${getButtonColor(course.color)}`}
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            className="h-12 rounded-full bg-bull px-8 text-sm font-semibold text-bull-foreground shadow-lg shadow-bull/25 transition-all hover:bg-bull/90 hover:shadow-bull/40 hover:-translate-y-0.5"
          >
            <Link href="https://app.kcmtrades.com/browse" className="flex items-center gap-2">
              <TrendingUpIcon />
              View All Courses
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
