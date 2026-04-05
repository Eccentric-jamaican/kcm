import type { NextFetchEvent, NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MARKETING_HOSTS = new Set(["kcmtrades.com", "www.kcmtrades.com"]);
const PLATFORM_HOSTS = new Set(["app.kcmtrades.com", "app.localhost:3000"]);
const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

function getHostname(request: Request) {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
}

function isAppSubdomain(hostname: string) {
  return PLATFORM_HOSTS.has(hostname);
}

function isMarketingDomain(hostname: string) {
  return MARKETING_HOSTS.has(hostname);
}

function handleRouting(request: NextRequest) {
  const hostname = getHostname(request);
  const { pathname } = request.nextUrl;

  if (isAppSubdomain(hostname)) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/app", request.url));
    }

    if (!pathname.startsWith("/app")) {
      return NextResponse.rewrite(new URL(`/app${pathname}`, request.url));
    }
  }

  if (isMarketingDomain(hostname) && pathname === "/app") {
    return NextResponse.redirect(new URL("https://app.kcmtrades.com/", request.url));
  }

  if (isMarketingDomain(hostname) && pathname.startsWith("/app/")) {
    return NextResponse.redirect(
      new URL(`https://app.kcmtrades.com${pathname.slice("/app".length)}`, request.url),
    );
  }
}

const clerkProxy = clerkMiddleware((auth, request) => {
  return handleRouting(request);
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!clerkEnabled) {
    return handleRouting(request);
  }

  return clerkProxy(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
