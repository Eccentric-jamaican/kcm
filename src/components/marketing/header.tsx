"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

// Premium inline SVG icons
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="8" y2="8"/>
    <line x1="4" x2="20" y1="16" y2="16"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#courses", label: "Courses" },
  { href: "#about", label: "About" },
];

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      {/* Glassmorphism navbar */}
      <div className="mx-4 mt-4 rounded-2xl border border-white/20 bg-white/80 shadow-lg shadow-black/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 md:mx-8 lg:mx-auto lg:max-w-6xl">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-lg font-semibold tracking-tight">
              KCM <span className="text-bull">Trades</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="h-8">
                    Log in
                  </Button>
                </SignInButton>
                <Button size="sm" className="h-8 bg-bull px-4 text-sm font-medium text-bull-foreground shadow-sm shadow-bull/20 transition-all hover:bg-bull/90 hover:shadow-bull/30">
                  <Link href="https://app.kcmtrades.com">Get Started</Link>
                </Button>
              </>
            ) : (
              <Button size="sm" className="h-8 bg-bull px-4 text-sm font-medium text-bull-foreground shadow-sm shadow-bull/20 transition-all hover:bg-bull/90 hover:shadow-bull/30">
                <Link href="https://app.kcmtrades.com">Go to App</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/50 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full justify-center">
                      Log in
                    </Button>
                  </SignInButton>
                  <Button className="w-full justify-center bg-bull text-bull-foreground">
                    <Link href="https://app.kcmtrades.com">Get Started</Link>
                  </Button>
                </>
              ) : (
                <Button className="w-full justify-center bg-bull text-bull-foreground">
                  <Link href="https://app.kcmtrades.com">Go to App</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
