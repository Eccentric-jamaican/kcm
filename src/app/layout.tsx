import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", poppins.variable)}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );

  if (!clerkEnabled) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
