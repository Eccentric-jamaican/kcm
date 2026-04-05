import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KCM Trades - Master Trading with Expert Guidance",
  description:
    "Learn proven trading strategies from industry experts. Access comprehensive courses, live sessions, and a supportive community to accelerate your trading journey.",
  keywords: [
    "trading",
    "trading courses",
    "stock trading",
    "technical analysis",
    "trading education",
    "learn to trade",
    "KCM Trades",
  ],
  openGraph: {
    title: "KCM Trades - Master Trading with Expert Guidance",
    description:
      "Learn proven trading strategies from industry experts. Access comprehensive courses, live sessions, and a supportive community.",
    type: "website",
    url: "https://kcmtrades.com",
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
