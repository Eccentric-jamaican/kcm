"use client";

"use client";

import Image from "next/image";

function SpreadsheetVisual() {
  const rows = [
    { symbol: "EUR/USD", pnl: "+$1,240", win: "68%", trades: "45", factor: 1.2 },
    { symbol: "GBP/USD", pnl: "+$890", win: "72%", trades: "32", factor: 0.9 },
    { symbol: "USD/JPY", pnl: "+$2,100", win: "75%", trades: "58", factor: 1.5 },
    { symbol: "AUD/USD", pnl: "-$340", win: "58%", trades: "28", factor: 0.6 },
    { symbol: "EUR/GBP", pnl: "+$650", win: "64%", trades: "38", factor: 0.8 },
  ];

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Trading Journal</span>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="p-4">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Symbol</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">P&L</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Win %</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Trades</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rows.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-muted/20">
                <td className="px-3 py-2.5 text-sm font-medium text-foreground">{row.symbol}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    row.pnl.startsWith('+') 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {row.pnl}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-sm text-foreground">{row.win}</td>
                <td className="px-3 py-2.5 text-right text-sm text-muted-foreground">{row.trades}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/30">
              <td className="px-3 py-2.5 text-sm font-semibold text-foreground">Total</td>
              <td className="px-3 py-2.5 text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  +$4,540
                </span>
              </td>
              <td className="px-3 py-2.5 text-right text-sm font-medium text-green-600">67%</td>
              <td className="px-3 py-2.5 text-right text-sm font-medium text-foreground">201</td>
            </tr>
          </tfoot>
        </table>
        
        {/* Performance chart */}
        <div className="mt-4 rounded-lg bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Performance</span>
          </div>
          <div className="flex h-16 items-end gap-1">
            {[65, 72, 68, 78, 82, 75, 88, 92, 85, 95, 88, 100].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-blue-500" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  showSpreadsheet?: boolean;
}

const FeatureBlock = ({
  label,
  title,
  description,
  ctaText,
  ctaHref = "#",
  images,
  layout,
  showSpreadsheet,
}: FeatureBlockProps) => {
  const textContent = (
    <div className="flex flex-col justify-center">
      <h3 className="mb-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h3>
      <p className="mb-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>
      <a
        href={ctaHref}
        className="inline-flex w-fit items-center justify-center rounded-lg bg-kcm-red px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-kcm-red/90 hover:shadow-lg hover:shadow-kcm-red/25"
      >
        {ctaText}
      </a>
    </div>
  );

  const imageContent = showSpreadsheet ? (
    <SpreadsheetVisual />
  ) : (
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
    title: "Excel trading sheet",
    description:
      "Track your trades, analyze performance, and identify patterns with our comprehensive trading spreadsheet.",
    ctaText: "Start Free Preview",
    images: [],
    layout: "text-left" as const,
    showSpreadsheet: true,
  },
  {
    label: "Your Time",
    title: "Access to webinars",
    description:
      "Our students master the essentials in just 4 weeks. With daily video lessons, live trading sessions, and a supportive community, you'll build confidence fast. You focus on learning — the platform handles the rest.",
    ctaText: "See Learning Path",
    images: [{ src: "/hero-image2.png", alt: "Learning dashboard" }],
    layout: "text-right" as const,
  },
  {
    label: "Platform Benefits",
    title: "Flexibility to your time",
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
        <div className="absolute left-0 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-kcm-red/3 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-[500px] w-[500px] translate-x-1/3 rounded-full bg-kcm-burgundy/3 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-24">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Tools we give you
          </h2>
          <p className="mt-6 text-sm text-muted-foreground sm:text-base">
            7 years of trading expertise in your pocket.
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
              showSpreadsheet={feature.showSpreadsheet}
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
            className="inline-flex items-center justify-center rounded-xl bg-kcm-burgundy px-8 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-kcm-burgundy/90 hover:shadow-xl"
          >
            View All Courses
          </a>
        </div>
      </div>
    </section>
  );
}
