"use client";

import { useState } from "react";

// Premium inline SVG icons
const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.768-.695-1.327-.825-.55-.13-1.07-.14-1.54-.03-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368h.003z"/>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const testimonials = [
  {
    id: 1,
    name: "Marcus Johnson",
    handle: "@marcus_trades",
    avatar: "MJ",
    platform: "twitter",
    content: "KCM Trades completely changed my approach to trading. Went from losing money consistently to making consistent profits within 3 months. The risk management strategies alone are worth the price!",
    rating: 5,
    date: "2 weeks ago",
    featured: true,
  },
  {
    id: 2,
    name: "Sarah Chen",
    handle: "@sarahc_invests",
    avatar: "SC",
    platform: "instagram",
    content: "Finally a trading course that actually teaches you HOW to trade, not just theory. Kevin breaks down complex concepts so simply. My portfolio is up 34% since completing the course!",
    rating: 5,
    date: "1 month ago",
    featured: false,
  },
  {
    id: 3,
    name: "David Rodriguez",
    handle: "@drodriguezfx",
    avatar: "DR",
    platform: "twitter",
    content: "The live Q&A sessions are gold. Being able to ask questions in real-time and get feedback from a professional trader accelerated my learning by months. Highly recommend!",
    rating: 5,
    date: "3 weeks ago",
    featured: false,
  },
  {
    id: 4,
    name: "Emily Watson",
    handle: "@emilyw_trading",
    avatar: "EW",
    platform: "linkedin",
    content: "As someone who knew nothing about trading, I was intimidated at first. But the curriculum is so well-structured that I felt confident placing my first trade within 2 weeks. Now trading is my primary income source.",
    rating: 5,
    date: "2 months ago",
    featured: true,
  },
  {
    id: 5,
    name: "James Park",
    handle: "@jpark_trader",
    avatar: "JP",
    platform: "twitter",
    content: "The community aspect is what sets KCM Trades apart. Having access to other traders and getting different perspectives has been invaluable. Plus the templates and resources save me hours every week.",
    rating: 5,
    date: "1 week ago",
    featured: false,
  },
  {
    id: 6,
    name: "Aisha Patel",
    handle: "@aisha_fx",
    avatar: "AP",
    platform: "instagram",
    content: "Best investment I have ever made in myself. The technical analysis module alone helped me identify setups I was completely missing before. Thank you Kevin and team!",
    rating: 5,
    date: "3 weeks ago",
    featured: false,
  },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "twitter":
      return <TwitterIcon />;
    case "instagram":
      return <InstagramIcon />;
    case "linkedin":
      return <LinkedinIcon />;
    default:
      return <TwitterIcon />;
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "twitter":
      return "bg-sky-500/10 text-sky-500";
    case "instagram":
      return "bg-pink-500/10 text-pink-500";
    case "linkedin":
      return "bg-blue-500/10 text-blue-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function TestimonialsSection() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-bull/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-bull/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Success Stories
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Trusted by{" "}
            <span className="text-bull">400+</span>{" "}
            Traders Worldwide
          </h2>
          <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            See what our students are saying about their transformation
            from beginners to confident traders.
          </p>
        </div>

        {/* Video Testimonial Highlight */}
        <div className="mt-16 flex justify-center">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border/50 bg-muted/30 shadow-2xl shadow-black/5">
            <div className="aspect-video w-full">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <button
                  onClick={() => setActiveVideo(activeVideo === 1 ? null : 1)}
                  className="group flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-xl shadow-black/10 transition-all hover:scale-110 hover:bg-white"
                >
                  <PlayIcon />
                </button>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-bull to-bull/70 text-sm font-bold text-white">
                  MJ
                </div>
                <div>
                  <p className="font-semibold text-white">Marcus Johnson</p>
                  <p className="text-sm text-white/70">Student since 2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`group relative rounded-2xl border border-border/50 bg-white/50 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-bull/20 hover:shadow-xl hover:shadow-bull/5 ${
                testimonial.featured ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-bull/10 text-bull opacity-50">
                <QuoteIcon />
              </div>

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/60 text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.handle}</p>
                  </div>
                </div>
                <div className={`rounded-lg p-1.5 ${getPlatformColor(testimonial.platform)}`}>
                  {getPlatformIcon(testimonial.platform)}
                </div>
              </div>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>

              {/* Content */}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Footer */}
              <p className="mt-4 text-xs text-muted-foreground">{testimonial.date}</p>

              {/* Hover accent */}
              <div className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-bull/0 via-bull/30 to-bull/0 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-16 grid gap-8 border-t border-border/50 pt-16 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-bull">4.9/5.0</p>
            <p className="mt-1 text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-bull">400+</p>
            <p className="mt-1 text-sm text-muted-foreground">Happy Students</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-bull">$2M+</p>
            <p className="mt-1 text-sm text-muted-foreground">Profits Generated</p>
          </div>
        </div>
      </div>
    </section>
  );
}
