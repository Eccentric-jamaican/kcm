import Image from "next/image";

// Premium inline SVG icons
const AwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const mentorStats = [
  { icon: TrendingUpIcon, value: "10+", label: "Years Trading" },
  { icon: AwardIcon, value: "$2M+", label: "Profits Generated" },
];

const credentials = [
  "Former Wall Street Trader",
  "Certified Technical Analyst (CMT)",
  "Featured in Forbes & Bloomberg",
  "Hedge Fund Consultant",
];

export function MentorSection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ backgroundColor: "#f4f4f5" }}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-bull/5 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-bear/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Learn From The Best
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Meet Your{" "}
            <span className="text-bull">Mentor</span>
          </h2>
          <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Get personalized guidance from a seasoned trader who has walked the path
            you are about to embark on.
          </p>
        </div>

        {/* Mentor Content */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image Side */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative h-[400px] w-[320px] overflow-hidden rounded-3xl shadow-2xl shadow-black/10 sm:h-[480px] sm:w-[380px]">
                <Image
                  src="/mentor.png"
                  alt="Kevin C. Martin - Lead Trader & Founder"
                  fill
                  className="object-cover"
                  priority
                />

                {/* Decorative frame */}
                <div className="absolute inset-0 rounded-3xl border-2 border-white/20" />
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl border border-border/50 bg-white/90 p-4 shadow-xl shadow-black/5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-bull/20 to-bull/5">
                    <StarIcon />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-bull">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">4.9/5.0 Rating</p>
                  </div>
                </div>
              </div>

              {/* Experience Badge */}
              <div className="absolute -right-4 top-8 rounded-xl border border-border/50 bg-white/90 px-4 py-3 shadow-xl shadow-black/5 backdrop-blur-xl sm:-right-8">
                <p className="text-2xl font-bold text-bull">10+</p>
                <p className="text-xs text-muted-foreground">Years Experience</p>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="flex flex-col">
            {/* Name & Title */}
            <div>
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
                Kevin C. Martin
              </h3>
              <p className="mt-1 text-base font-medium text-bull">
                Lead Trader & Founder
              </p>
            </div>

            {/* Bio */}
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              With over a decade of experience trading forex, stocks, and commodities,
              I have developed a systematic approach to trading that emphasizes risk management
              and consistent profitability. My strategies have helped thousands of students
              achieve financial independence through trading.
            </p>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              After years on Wall Street and managing private portfolios, I founded KCM Trades
              to democratize trading education and make professional-grade strategies accessible
              to everyone.
            </p>

            {/* Credentials */}
            <div className="mt-8 space-y-3">
              {credentials.map((credential) => (
                <div key={credential} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-bull/10">
                    <CheckIcon />
                  </div>
                  <span className="text-sm text-foreground">{credential}</span>
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {mentorStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/50 bg-white/50 p-4 text-center backdrop-blur-sm transition-all hover:border-bull/30 hover:shadow-lg hover:shadow-bull/5"
                >
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-bull/15 to-bull/5 text-bull">
                    <stat.icon />
                  </div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mt-8 rounded-2xl border-l-4 border-bull bg-white/50 p-6 backdrop-blur-sm">
              <p className="text-base italic text-muted-foreground">
                &ldquo;Trading is not about being right all the time. It is about managing risk
                and letting your winners run. I will teach you how to think like a professional
                trader.&rdquo;
              </p>
              <footer className="mt-3 text-sm font-medium text-foreground">
                — Kevin C. Martin
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
