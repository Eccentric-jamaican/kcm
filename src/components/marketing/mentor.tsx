import Image from "next/image";

export function MentorSection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ backgroundColor: "#f8f4f4" }}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-kcm-red/5 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-kcm-burgundy/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Learn From The Best
          </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Meet Your{" "}
            <span className="text-kcm-red">Mentor</span>
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
                  alt="Kenneth Morris - Lead Trader & Founder"
                  fill
                  className="object-cover"
                  priority
                />

              {/* Decorative frame */}
              <div className="absolute inset-0 rounded-3xl border-2 border-white/20" />
            </div>
          </div>
          </div>

          {/* Content Side */}
          <div className="flex flex-col">
            {/* Name & Title */}
            <div>
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
                Kenneth Morris
              </h3>
              <p className="mt-1 text-base font-medium text-kcm-red">
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

            {/* Quote */}
            <figure className="mt-8 flex flex-col items-center text-center">
              <blockquote className="max-w-lg">
                <p className="text-lg text-muted-foreground">
                  &ldquo;Trading is not about being right all the time. It is about managing risk
                  and letting your winners run. I will teach you how to think like a professional
                  trader.&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-medium text-foreground">Kenneth Morris</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
