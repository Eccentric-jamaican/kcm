import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

// Premium inline SVG icons
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

const PlayIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const StarIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const socialProofAvatars = [
  {
    name: "Alicia",
    initials: "AL",
    src: "https://i.pravatar.cc/80?img=32",
  },
  {
    name: "Brandon",
    initials: "BK",
    src: "https://i.pravatar.cc/80?img=15",
  },
  {
    name: "Camila",
    initials: "CM",
    src: "https://i.pravatar.cc/80?img=48",
  },
  {
    name: "Darius",
    initials: "DT",
    src: "https://i.pravatar.cc/80?img=57",
  },
];

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen overflow-hidden pt-32"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Premium background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-right gradient blob */}
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-bull/5 blur-3xl" />
        {/* Bottom-left gradient blob */}
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-bear/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
          {/* Text Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Premium Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-bull/20 bg-bull/5 px-4 py-2 text-xs font-medium uppercase tracking-wider text-bull backdrop-blur-sm">
              <TrendingUpIcon />
              <span>Join 400+ successful traders</span>
            </div>

            {/* Premium Headline */}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-6xl">
              Trading,{" "}
              <span className="relative inline-block">
                <span className="relative z-10">redefined</span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-bull/30 to-bull/10 -z-0" />
              </span>
              <br />
              for real profits.
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
              We teach trading strategies online—simple, direct, and led by expert traders.
              No fluff. No unnecessary complexity. Just strategies that work.
            </p>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium tracking-wide text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-bull" />
                <span>EXPERT-LED</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-bull" />
                <span>100% ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-bull" />
                <span>LIFETIME ACCESS</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                size="lg"
                className="h-12 bg-bull px-8 text-sm font-semibold text-bull-foreground shadow-lg shadow-bull/25 transition-all hover:bg-bull/90 hover:shadow-bull/40 hover:-translate-y-0.5"
              >
                <Link href="/find-my-classes?np=t" className="flex items-center gap-2">
                  Start Learning
                  <ArrowRightIcon />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-border/50 bg-white/50 px-8 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/80 hover:-translate-y-0.5"
              >
                <Link href="#courses" className="flex items-center gap-2">
                  <PlayIcon />
                  Explore Courses
                </Link>
              </Button>
            </div>

            {/* Premium Social Proof */}
            <div className="mt-12 flex items-center gap-4">
              <AvatarGroup>
                {socialProofAvatars.map((person) => (
                  <Avatar key={person.initials} size="lg" className="shadow-sm">
                    <AvatarImage src={person.src} alt={`${person.name} student profile`} />
                    <AvatarFallback className="bg-gradient-to-br from-muted to-muted/80 text-xs font-semibold text-foreground">
                      {person.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <AvatarGroupCount>+400</AvatarGroupCount>
              </AvatarGroup>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} className="h-3.5 w-3.5 text-bull" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Trusted by <span className="font-semibold text-foreground">400+</span> students
                </p>
              </div>
            </div>
          </div>

          {/* Premium Visual Content */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Main Card - Premium Design */}
              <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-white/80 p-2 shadow-2xl shadow-black/10 backdrop-blur-xl">
                {/* Card inner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted">
                  {/* Hero image collage */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    <Image
                      src="/hero-image1.png"
                      alt="Trading setup with market charts on laptop and monitor"
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/10" />
                    <div className="absolute bottom-4 right-4 w-[36%] overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-1 shadow-xl shadow-black/15 backdrop-blur-sm">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem]">
                        <Image
                          src="/hero-image2.png"
                          alt="Mobile trading chart in front of a live market screen"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Advanced Trading Strategies</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">Module 3: Technical Analysis</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bull/10">
                        <TrendingUpIcon />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-bull">67%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div className="h-1.5 w-2/3 rounded-full bg-gradient-to-r from-bull to-bull/70" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
