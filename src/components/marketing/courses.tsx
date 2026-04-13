"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

type InstagramPermalinkType = "p" | "reel";

type InstagramPost = {
  id: string;
  type: InstagramPermalinkType;
  caption: string;
  thumbnailSrc: string;
};

// Instagram IDs from public URLs.
// Post format: https://www.instagram.com/p/POST_ID/
// Reel format: https://www.instagram.com/reel/REEL_ID/
const instagramPosts: InstagramPost[] = [
  { id: "DVkeMhbl9np", type: "p", caption: "Trade result 1", thumbnailSrc: "/images/instagram/trade-1.jpg" },
  { id: "DWCZ_EZisEU", type: "reel", caption: "Trade result 2", thumbnailSrc: "/images/instagram/trade-2.jpg" },
  { id: "DUDX512lUAn", type: "p", caption: "Trade result 3", thumbnailSrc: "/images/instagram/trade-3.jpg" },
];

function InstagramThumbnailCard({ post }: { post: InstagramPost }) {
  const postUrl = `https://www.instagram.com/${post.type}/${post.id}/`;

  return (
    <a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={post.thumbnailSrc}
          alt={post.caption}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium text-foreground">{post.caption}</p>
        <span className="text-sm font-semibold text-kcm-red">View on Instagram</span>
      </div>
    </a>
  );
}

export function CoursesSection() {
  return (
    <section
      id="courses"
      className="relative overflow-hidden bg-background py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-kcm-red/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Proven Results
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Real Trades,{" "}
            <span className="text-kcm-red">Real Profits</span>
          </h2>
          <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Watch real trading results from Kenneth. Every video is live proof of the
            strategies you will learn in the course.
          </p>
        </div>

        {/* Instagram Videos Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {instagramPosts.map((post) => (
            <InstagramThumbnailCard key={post.id} post={post} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="h-12 rounded-full bg-kcm-red px-8 text-sm font-semibold text-white shadow-lg shadow-kcm-red/25 transition-all hover:bg-kcm-red/90 hover:shadow-kcm-red/40 hover:-translate-y-0.5"
          >
            <Link href="https://app.kcmtrades.com/browse" className="flex items-center gap-2">
              <TrendingUpIcon />
              Start Trading Like This
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
