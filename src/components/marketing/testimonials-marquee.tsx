"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// Testimonial data with screenshot images
const row1Testimonials = [
  {
    id: 1,
    image: "/testimonials/testimonial-1.png",
    logo: "/logos/platform-1.svg",
    logoAlt: "Platform 1",
  },
  {
    id: 2,
    image: "/testimonials/testimonial-2.png",
    logo: "/logos/platform-2.svg",
    logoAlt: "Platform 2",
  },
  {
    id: 3,
    image: "/testimonials/testimonial-3.png",
    logo: "/logos/platform-3.svg",
    logoAlt: "Platform 3",
  },
  {
    id: 4,
    image: "/testimonials/testimonial-4.png",
    logo: "/logos/platform-4.svg",
    logoAlt: "Platform 4",
  },
];

const row2Testimonials = [
  {
    id: 5,
    image: "/testimonials/testimonial-5.png",
    logo: "/logos/platform-5.svg",
    logoAlt: "Platform 5",
  },
  {
    id: 6,
    image: "/testimonials/testimonial-6.png",
    logo: "/logos/platform-6.svg",
    logoAlt: "Platform 6",
  },
  {
    id: 7,
    image: "/testimonials/testimonial-7.png",
    logo: "/logos/platform-7.svg",
    logoAlt: "Platform 7",
  },
  {
    id: 8,
    image: "/testimonials/testimonial-8.png",
    logo: "/logos/platform-8.svg",
    logoAlt: "Platform 8",
  },
];

interface TestimonialCardProps {
  image: string;
  logo: string;
  logoAlt: string;
  className?: string;
}

function TestimonialCard({ image, logo, logoAlt, className }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "relative flex-shrink-0 overflow-hidden rounded-2xl border border-border/30 bg-white/80 shadow-sm",
        "w-[340px] sm:w-[380px]",
        className
      )}
    >
      {/* Screenshot Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image}
          alt="Testimonial"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 340px, 380px"
        />
      </div>

      {/* Platform Logo - Bottom Right */}
      <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm">
        <Image
          src={logo}
          alt={logoAlt}
          width={24}
          height={24}
          className="object-contain"
        />
      </div>
    </div>
  );
}

interface MarqueeRowProps {
  testimonials: typeof row1Testimonials;
  direction?: "left" | "right";
  speed?: number;
  className?: string;
}

function MarqueeRow({ testimonials, direction = "left", speed = 40, className }: MarqueeRowProps) {
  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Gradient masks for smooth edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

      <div
        className={cn(
          "flex gap-6 py-4",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <TestimonialCard
            key={`${testimonial.id}-${index}`}
            image={testimonial.image}
            logo={testimonial.logo}
            logoAlt={testimonial.logoAlt}
          />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsMarqueeSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Success Stories
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Trusted by{" "}
            <span className="text-bull">400+</span>{" "}
            Traders Worldwide
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            See what our students are saying about their transformation
            from beginners to confident traders.
          </p>
        </div>
      </div>

      {/* Marquee Rows */}
      <div className="mt-12 space-y-6">
        {/* Row 1 - Moving Left */}
        <MarqueeRow testimonials={row1Testimonials} direction="left" speed={50} />

        {/* Row 2 - Moving Right */}
        <MarqueeRow testimonials={row2Testimonials} direction="right" speed={45} />
      </div>
    </section>
  );
}
