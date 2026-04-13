"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// WhatsApp logo SVG component
const WhatsAppLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="#25D366"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// Actual WhatsApp testimonial images from public/testimonials
const row1Testimonials = [
  {
    id: 1,
    image: "/testimonials/IMG-20260405-WA0012.jpg",
  },
  {
    id: 2,
    image: "/testimonials/IMG-20260405-WA0024.jpg",
  },
  {
    id: 3,
    image: "/testimonials/IMG-20260405-WA0025.jpg",
  },
  {
    id: 4,
    image: "/testimonials/IMG-20260405-WA0026.jpg",
  },
];

const row2Testimonials = [
  {
    id: 5,
    image: "/testimonials/IMG-20260405-WA0027.jpg",
  },
  {
    id: 6,
    image: "/testimonials/IMG-20260405-WA0012.jpg",
  },
  {
    id: 7,
    image: "/testimonials/IMG-20260405-WA0024.jpg",
  },
  {
    id: 8,
    image: "/testimonials/IMG-20260405-WA0025.jpg",
  },
];

interface TestimonialCardProps {
  image: string;
  className?: string;
}

function TestimonialCard({ image, className }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "relative flex-shrink-0 overflow-hidden rounded-2xl border border-border/30 bg-white/80 shadow-sm",
        "w-[300px] sm:w-[340px]",
        className
      )}
    >
      {/* Screenshot Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={image}
          alt="Testimonial"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 300px, 340px"
        />
      </div>

      {/* WhatsApp Logo - Bottom Right */}
      <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm">
        <WhatsAppLogo />
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
            <span className="text-kcm-red">400+</span>{" "}
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
