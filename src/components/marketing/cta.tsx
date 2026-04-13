import Link from "next/link";

// Premium inline SVG icons
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const benefits = [
  "Access to all courses and future updates",
  "Live Q&A sessions with expert traders",
  "Private community membership",
  "Downloadable resources and tools",
  "Certificate of completion",
  "30-day money-back guarantee",
];

export function CTASection() {
  return (
    <section
      className="relative overflow-hidden bg-kcm-burgundy py-24 sm:py-32"
    >
        {/* Premium background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs - using kcm red tones */}
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-kcm-red/30 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-kcm-burgundy/40 blur-[80px]" />
      </div>
      
      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tagline */}
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-background/40">
            With You From Start to Success
          </p>
          
          {/* Premium Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-kcm-silver/30 bg-kcm-silver/10 px-4 py-2 text-sm font-medium text-kcm-silver backdrop-blur-sm">
            <TrendingUpIcon />
            <span>Start your trading journey today</span>
          </div>
          
          {/* Headline */}
          <h2 className="text-balance text-3xl font-bold tracking-tight text-background sm:text-4xl md:text-5xl">
            Ready to Start Your{" "}
            <span className="bg-gradient-to-r from-kcm-silver to-kcm-silver/70 bg-clip-text text-transparent">
              Trading Journey
            </span>?
          </h2>
          
          <p className="mt-6 text-balance text-lg leading-relaxed text-background/60">
            Join thousands of successful traders who have transformed their skills with KCM Trades. 
            Get unlimited access to all courses, resources, and community features.
          </p>

          {/* Benefits Grid */}
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-background/80 backdrop-blur-sm"
              >
                <CheckCircleIcon />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/find-my-classes?np=t"
              className="inline-flex h-14 items-center gap-2 bg-kcm-silver px-10 text-base font-semibold text-kcm-burgundy shadow-lg shadow-kcm-silver/30 transition-all hover:bg-kcm-silver/90 hover:shadow-kcm-silver/50 hover:-translate-y-0.5"
            >
              Get Started Today
              <ArrowRightIcon />
            </Link>
            <Link
              href="#courses"
              className="inline-flex h-14 items-center gap-2 border border-background/20 bg-transparent px-10 text-base font-medium text-background transition-all hover:bg-background/10 hover:-translate-y-0.5"
            >
              Explore Courses
            </Link>
          </div>

          <p className="mt-8 text-sm text-background/40">
            No credit card required. Start with a free trial.
          </p>
        </div>
      </div>
    </section>
  );
}
