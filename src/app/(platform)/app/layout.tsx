"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"

function PlatformHeader() {
  const pathname = usePathname()
  const isBrowsePage = pathname === "/app/browse"
  const showDesktopSearch = !isBrowsePage
  const showMobileSearch = !isBrowsePage

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/app" className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-3xl">
            <span aria-hidden>🧑🏽</span>
            <span className="sr-only">Go to dashboard</span>
          </Link>

          <Link
            href="/app/browse"
            className="hidden items-center gap-1 text-base font-medium text-foreground/90 transition-colors hover:text-foreground sm:inline-flex"
          >
            Browse
            <span className="text-xs">▾</span>
          </Link>
        </div>

        {showDesktopSearch ? (
          <div className="hidden w-full max-w-md flex-1 md:block">
            <label className="relative block">
              <HugeiconsIcon
                icon={SearchIcon}
                strokeWidth={2}
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                placeholder="What do you want to learn today?"
                className="h-12 rounded-full bg-muted/50 pl-9"
              />
            </label>
          </div>
        ) : (
          <div className="hidden flex-1 md:block" />
        )}

        {showMobileSearch ? (
          <div className="flex flex-1 md:hidden">
            <label className="relative block w-full">
              <HugeiconsIcon
                icon={SearchIcon}
                strokeWidth={2}
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                placeholder="Search"
                className="h-10 rounded-full bg-muted/50 pl-9"
              />
            </label>
          </div>
        ) : (
          <div className="flex-1 md:hidden" />
        )}

        <div className="hidden items-center gap-4 sm:gap-5 md:flex">
          <Link
            href="/app/browse"
            className="hidden text-lg font-medium text-foreground/90 transition-colors hover:text-foreground sm:inline-block"
          >
            Feedback
          </Link>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-1 py-1 transition-colors hover:bg-muted"
            aria-label="Open account menu"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-pink-100 to-purple-100 text-xs">
                AE
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">Addis</span>
            <span className="hidden text-xs sm:inline">▾</span>
          </button>
        </div>

        <button
          type="button"
          aria-label="Open navigation menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-2xl text-foreground/85 transition-colors hover:bg-muted md:hidden"
        >
          ☰
        </button>
      </div>
    </header>
  )
}

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-[#f2f2f4]">
      <PlatformHeader />
      <div className="mx-auto w-full max-w-[1400px]">{children}</div>
    </div>
  )
}
