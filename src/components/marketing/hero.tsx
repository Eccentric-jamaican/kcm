import Link from "next/link";
import { Button } from "@/components/ui/button";

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#3359ff] py-16 sm:py-20 lg:py-24">
      {/* Subtle gradient overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#3359ff] via-[#2d4fe6] to-[#2644cc]" />
      
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Main Headline */}
          <h1 className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Build your career on modern full-stack skills
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-lg text-balance text-lg leading-relaxed text-white/90 sm:text-xl">
            Join cohort-based courses with Antonio and get really good at modern development
          </p>

          {/* CTA Button */}
          <div className="mt-10">
            <Link href="/courses" className="inline-flex">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-white px-6 text-sm font-semibold text-gray-900 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  Browse courses
                  <ChevronRightIcon />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
