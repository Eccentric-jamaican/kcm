import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KCM Trades - Master Trading with Expert Guidance",
  description:
    "Learn proven trading strategies from industry experts. Access comprehensive courses, live sessions, and a supportive community to accelerate your trading journey.",
};

function isAppHost(hostname: string) {
  return hostname === "app.kcmtrades.com" || hostname === "app.localhost:3000";
}

function getMarketingOrigin(hostname: string) {
  if (hostname === "localhost:3000" || hostname === "app.localhost:3000") {
    return "http://localhost:3000";
  }

  return "https://kcmtrades.com";
}

function getPlatformOrigin(hostname: string) {
  if (hostname === "localhost:3000" || hostname === "app.localhost:3000") {
    return "http://app.localhost:3000";
  }

  return "https://app.kcmtrades.com";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const hostname = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const appHost = isAppHost(hostname);
  const marketingOrigin = getMarketingOrigin(hostname);
  const platformOrigin = getPlatformOrigin(hostname);

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", poppins.variable)}
    >
      <body className="min-h-full flex flex-col">
        {clerkEnabled ? (
          <ClerkProvider
            allowedRedirectOrigins={appHost ? undefined : [platformOrigin]}
            domain={appHost ? hostname : undefined}
            isSatellite={appHost}
            signInUrl={appHost ? `${marketingOrigin}/sign-in` : "/sign-in"}
            signUpUrl={appHost ? `${marketingOrigin}/sign-up` : "/sign-up"}
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
