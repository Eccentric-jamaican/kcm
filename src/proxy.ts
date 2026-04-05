import type { NextFetchEvent, NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MARKETING_HOSTS = new Set(["kcmtrades.com", "www.kcmtrades.com", "localhost:3000"]);
const PLATFORM_HOSTS = new Set(["app.kcmtrades.com", "app.localhost:3000"]);
const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

function getHostname(request: Request) {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
}

function getProtocol(request: NextRequest) {
  return request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
}

function isAppSubdomain(hostname: string) {
  return PLATFORM_HOSTS.has(hostname);
}

function isMarketingDomain(hostname: string) {
  return MARKETING_HOSTS.has(hostname);
}

function isAuthPath(pathname: string) {
  return (
    pathname === "/sign-in" ||
    pathname.startsWith("/sign-in/") ||
    pathname === "/sign-up" ||
    pathname.startsWith("/sign-up/") ||
    pathname === "/login" ||
    pathname === "/signup"
  );
}

function getCanonicalAuthPath(pathname: string) {
  if (pathname === "/login") return "/sign-in";
  if (pathname === "/signup") return "/sign-up";
  return pathname;
}

function getMarketingOrigin(request: NextRequest) {
  const protocol = getProtocol(request);
  const hostname = getHostname(request);

  // In local dev, marketing and app share the same origin
  if (hostname === "localhost:3000" || hostname === "app.localhost:3000") {
    return `${protocol}://localhost:3000`;
  }

  return `${protocol}://kcmtrades.com`;
}

function getPlatformOrigin(request: NextRequest) {
  const protocol = getProtocol(request);
  const hostname = getHostname(request);

  // In local dev, marketing and app share the same origin
  if (hostname === "localhost:3000" || hostname === "app.localhost:3000") {
    return `${protocol}://localhost:3000`;
  }

  return `${protocol}://app.kcmtrades.com`;
}

function buildAbsoluteUrl(origin: string, pathname: string, search: string) {
  return `${origin}${pathname}${search}`;
}

function buildSignInUrl(request: NextRequest, redirectUrl: string) {
  // Always use relative path for sign-in in single-origin setup
  const url = new URL("/sign-in", request.url);
  url.searchParams.set("redirect_url", redirectUrl);
  return url;
}

function buildCanonicalAuthUrl(request: NextRequest) {
  const url = new URL(getCanonicalAuthPath(request.nextUrl.pathname), request.url);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  if (!url.searchParams.has("redirect_url")) {
    url.searchParams.set("redirect_url", "/app");
  }

  return url;
}

function handleRouting(request: NextRequest) {
  const hostname = getHostname(request);
  const { pathname } = request.nextUrl;

  if (isAppSubdomain(hostname)) {
    // In local dev, don't redirect auth paths - handle them on same origin
    if (isAuthPath(pathname)) {
      // Only redirect to canonical path if needed
      const canonicalPath = getCanonicalAuthPath(pathname);
      if (canonicalPath !== pathname) {
        return NextResponse.redirect(new URL(canonicalPath, request.url));
      }
      return NextResponse.next();
    }

    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/app", request.url));
    }

    if (!pathname.startsWith("/app")) {
      return NextResponse.rewrite(new URL(`/app${pathname}`, request.url));
    }
  }

  // For single-origin setup, /app paths on marketing domain are handled normally
  // No redirects needed - the route group (platform)/app handles the routing
}

// NO SATELLITE MODE - single origin setup for local dev
const clerkProxy = clerkMiddleware(async (auth, request) => {
  const hostname = getHostname(request);

  if (isAppSubdomain(hostname) && !isAuthPath(request.nextUrl.pathname)) {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(
        buildSignInUrl(
          request,
          buildAbsoluteUrl(getPlatformOrigin(request), request.nextUrl.pathname, request.nextUrl.search),
        ),
      );
    }
  }

  return handleRouting(request);
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const hostname = getHostname(request);

  // In local dev with single origin, don't redirect auth paths
  if (isAppSubdomain(hostname) && isAuthPath(request.nextUrl.pathname)) {
    const canonicalPath = getCanonicalAuthPath(request.nextUrl.pathname);
    if (canonicalPath !== request.nextUrl.pathname) {
      return NextResponse.redirect(new URL(canonicalPath, request.url));
    }
    return NextResponse.next();
  }

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
