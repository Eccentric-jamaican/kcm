"use client";

import Image from "next/image";

interface FeatureBlockProps {
  label: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref?: string;
  images: {
    src: string;
    alt: string;
    className?: string;
  }[];
  layout: "text-left" | "text-right";
}

const FeatureBlock = ({
  label,
  title,
  description,
  ctaText,
  ctaHref = "#",
  images,
  layout,
}: FeatureBlockProps) => {
  const textContent = (
    <div className="flex flex-col justify-center">
      <span className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-bull">
        {label}
      </span>
      <h3 className="mb-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h3>
      <p className="mb-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>
      <a
        href={ctaHref}
        className="inline-flex w-fit items-center justify-center rounded-lg bg-bull px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-bull/90 hover:shadow-lg hover:shadow-bull/25"
      >
        {ctaText}
      </a>
    </div>
  );

  const imageContent = (
    <div
      className={`relative ${
        images.length === 3
          ? "grid grid-cols-2 gap-3"
          : "flex items-center justify-center"
      }`}
    >
      {images.length === 3 ? (
        <>
          {/* Top full-width image */}
          <div className="col-span-2 relative aspect-[16/10] overflow-hidden rounded-2xl">
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              className="object-cover"
            />
          </div>
          {/* Bottom two images */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={images[1].src}
              alt={images[1].alt}
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={images[2].src}
              alt={images[2].alt}
              fill
              className="object-cover"
            />
          </div>
        </>
      ) : images.length === 1 ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl sm:aspect-[16/12]">
          <Image
            src={images[0].src}
            alt={images[0].alt}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        images.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl"
          >
            <Image src={img.src} alt={img.alt} fill className="object-cover" />
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      {layout === "text-left" ? (
        <>
          <div className="order-1">{textContent}</div>
          <div className="order-2">{imageContent}</div>
        </>
      ) : (
        <>
          <div className="order-2 lg:order-1">{imageContent}</div>
          <div className="order-1 lg:order-2">{textContent}</div>
        </>
      )}
    </div>
  );
};

const features = [
  {
    label: "Getting Started",
    title: "What course should I take first?",
    description:
      "Start with our Foundation Course — the perfect entry point for beginners. Master the basics with expert guidance, proven strategies, and hands-on practice. Most successful traders started exactly where you are right now.",
    ctaText: "Start Free Preview",
    images: [
      { src: "/hero-image1.png", alt: "Trading fundamentals" },
      { src: "/hero-image2.png", alt: "Chart analysis" },
      { src: "/mentor.png", alt: "Expert mentor" },
    ],
    layout: "text-left" as const,
  },
  {
    label: "Your Time",
    title: "How long does it take to learn?",
    description:
      "Our students master the essentials in just 4 weeks. With daily video lessons, live trading sessions, and a supportive community, you'll build confidence fast. You focus on learning — the platform handles the rest.",
    ctaText: "See Learning Path",
    images: [{ src: "/hero-image2.png", alt: "Learning dashboard" }],
    layout: "text-right" as const,
  },
  {
    label: "Platform Benefits",
    title: "Is it easy to get started?",
    description:
      "Absolutely. All plans include instant access to course materials, downloadable resources, and our private community. Most students see results within their first month. Once you start trading with confidence, there's no going back.",
    ctaText: "Explore Features",
    images: [{ src: "/mentor.png", alt: "Community features" }],
    layout: "text-left" as const,
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-background py-20 sm:py-28 lg:py-32"
    >
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-bull/3 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-[500px] w-[500px] translate-x-1/3 rounded-full bg-bear/3 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-bull">
            Trading Education, Reimagined
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Everything you need to{" "}
            <span className="text-bull">succeed</span>.
          </h2>
          <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            A smarter approach to trading education, built around you. Learn
            proven strategies with the confidence that comes from expert
            guidance.
          </p>
        </div>

        {/* Feature Blocks */}
        <div className="space-y-20 lg:space-y-32">
          {features.map((feature, index) => (
            <FeatureBlock
              key={index}
              label={feature.label}
              title={feature.title}
              description={feature.description}
              ctaText={feature.ctaText}
              images={feature.images}
              layout={feature.layout}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center lg:mt-32">
          <p className="mb-4 text-sm text-muted-foreground">
            Ready to start your trading journey?
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center justify-center rounded-xl bg-foreground px-8 py-3 text-base font-semibold text-background transition-all duration-200 hover:bg-foreground/90 hover:shadow-xl"
          >
            View All Courses
          </a>
        </div>
      </div>
    </section>
  );
}
