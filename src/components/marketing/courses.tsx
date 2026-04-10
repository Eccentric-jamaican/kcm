"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef } from "react";
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
};

// Instagram IDs from public URLs.
// Post format: https://www.instagram.com/p/POST_ID/
// Reel format: https://www.instagram.com/reel/REEL_ID/
const instagramPosts: InstagramPost[] = [
  { id: "DVkeMhbl9np", type: "p", caption: "Trade result 1" },
  { id: "DWCZ_EZisEU", type: "reel", caption: "Trade result 2" },
  { id: "DUDX512lUAn", type: "p", caption: "Trade result 3" },
];

function InstagramEmbed({ post }: { post: InstagramPost }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const postUrl = `https://www.instagram.com/${post.type}/${post.id}/`;

  useEffect(() => {
    // Process embeds after component mounts
    if (window.instgrm && containerRef.current) {
      window.instgrm.Embeds.process(containerRef.current);
    }
  }, []);

  return (
    <div ref={containerRef} className="instagram-embed-container">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={postUrl}
        data-instgrm-version="14"
        data-instgrm-captioned
        style={{
          background: "#FFF",
          border: "0",
          borderRadius: "3px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "1px",
          maxWidth: "540px",
          minWidth: "326px",
          padding: "0",
          width: "calc(100% - 2px)",
        }}
      >
        <div style={{ padding: "16px" }}>
          <a
            href={postUrl}
            style={{
              background: "#FFFFFF",
              lineHeight: "0",
              padding: "0 0",
              textAlign: "center",
              textDecoration: "none",
              width: "100%",
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            View this post on Instagram
          </a>
        </div>
      </blockquote>
    </div>
  );
}

// TypeScript declaration for Instagram embed script
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: (element?: HTMLElement) => void;
      };
    };
  }
}

export function CoursesSection() {
  return (
    <section
      id="courses"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Instagram embed script - loads once for all embeds */}
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Process all embeds after script loads
          if (window.instgrm) {
            window.instgrm.Embeds.process();
          }
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-bull/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Proven Results
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Real Trades,{" "}
            <span className="text-bull">Real Profits</span>
          </h2>
          <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Watch real trading results from Kenneth. Every video is live proof of the
            strategies you will learn in the course.
          </p>
        </div>

        {/* Instagram Videos Grid */}
        <div className="mt-16 flex justify-center">
          {instagramPosts.map((post) => (
            <InstagramEmbed key={post.id} post={post} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="h-12 rounded-full bg-bull px-8 text-sm font-semibold text-bull-foreground shadow-lg shadow-bull/25 transition-all hover:bg-bull/90 hover:shadow-bull/40 hover:-translate-y-0.5"
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
