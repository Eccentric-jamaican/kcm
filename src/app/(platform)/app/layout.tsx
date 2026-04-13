"use client"

import { UserButton, useAuth, useUser } from "@clerk/nextjs"
import { useConvexAuth, useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"
import { api } from "../../../../convex/_generated/api"
import { ThemeToggle } from "@/components/theme-toggle"
import { getConvexErrorMessage } from "@/lib/convex-errors"

const authEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CONVEX_URL
)

function PlatformHeader({
  displayName,
  canAccessAdmin,
}: {
  displayName: string
  canAccessAdmin: boolean
}) {
  const pathname = usePathname()
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null)
  const isBrowsePage = pathname === "/app/browse"
  const showDesktopSearch = !isBrowsePage
  const showMobileSearch = !isBrowsePage
  const mobileMenuOpen = mobileMenuPath === pathname

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/app" className="flex h-14 items-center rounded-md px-1 text-lg font-semibold tracking-tight text-foreground">
            <span aria-hidden>KCM</span>
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
            href="/app/webinars"
            className="hidden text-lg font-medium text-foreground/90 transition-colors hover:text-foreground sm:inline-block"
          >
            Webinars
          </Link>
          <Link
            href="/app/browse"
            className="hidden text-lg font-medium text-foreground/90 transition-colors hover:text-foreground sm:inline-block"
          >
            Feedback
          </Link>
          {canAccessAdmin ? (
            <Link
              href="/app/admin"
              className="hidden text-lg font-medium text-foreground/90 transition-colors hover:text-foreground sm:inline-block"
            >
              Admin
            </Link>
          ) : null}

          <div className="inline-flex items-center gap-4">
            <ThemeToggle />
            <div className="inline-flex items-center gap-3 rounded-full px-1 py-1">
              <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
              <UserButton />
            </div>
          </div>
        </div>

        <Sheet
          open={mobileMenuOpen}
          onOpenChange={(nextOpen) => setMobileMenuPath(nextOpen ? pathname : null)}
        >
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="platform-mobile-navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-2xl text-foreground/85 transition-colors hover:bg-muted md:hidden"
            onClick={() => setMobileMenuPath(pathname)}
          >
            ☰
          </button>

          <SheetContent
            id="platform-mobile-navigation"
            side="left"
            className="w-[min(88vw,24rem)] border-r bg-background p-0 sm:max-w-none"
          >
            <SheetHeader className="border-b px-5 py-5 text-left">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>
                Jump between your dashboard, library, and account areas.
              </SheetDescription>
            </SheetHeader>

            <div className="flex h-full flex-col">
              <div className="space-y-2 px-3 py-4">
                {[
                  { href: "/app", label: "Dashboard" },
                  { href: "/app/browse", label: "Browse" },
                  { href: "/app/webinars", label: "Webinars" },
                  { href: "/app/browse", label: "Feedback" },
                  ...(canAccessAdmin ? [{ href: "/app/admin", label: "Admin" }] : []),
                ].map((item) => {
                  const isActive =
                    item.href === "/app"
                      ? pathname === "/app"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={`${item.href}:${item.label}`}
                      href={item.href}
                      onClick={() => setMobileMenuPath(null)}
                      className={`flex items-center rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                        isActive
                          ? "bg-foreground text-background"
                          : "text-foreground/85 hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="mt-auto border-t px-5 py-4">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">Signed in</p>
                  </div>
                  <UserButton />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

function PlatformLoadingShell({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
        <Spinner className="size-4" />
        <span>{message}</span>
      </div>
    </div>
  )
}

function PlatformShell({
  children,
  displayName,
  canAccessAdmin,
}: Readonly<{
  children: React.ReactNode
  displayName: string
  canAccessAdmin: boolean
}>) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/app/admin")
  const isCourseLesson = /^\/app\/courses\/[^/]+\/[^/]+$/.test(pathname)

  if (isAdmin || isCourseLesson) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <PlatformHeader displayName={displayName} canAccessAdmin={canAccessAdmin} />
      <div className="mx-auto w-full max-w-[1400px]">{children}</div>
    </div>
  )
}

function AuthenticatedPlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { userId, isLoaded: isClerkLoaded } = useAuth()
  const { user } = useUser()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const upsertCurrentUser = useMutation(api.users.upsertCurrentUser)
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  
  // Only call viewer query AFTER upsertCurrentUser succeeds
  // This ensures the Convex auth token is fully synced before querying
  const viewer = useQuery(api.users.viewer, (syncedUserId === userId && userId) ? {} : "skip")

  useEffect(() => {
    if (!isAuthenticated || !userId || !isClerkLoaded || syncedUserId === userId) {
      return
    }

    let cancelled = false

    upsertCurrentUser({})
      .then(() => {
        if (!cancelled) {
          setSyncError(null)
          // Add a small delay to ensure the auth token is fully propagated
          // before firing the viewer query
          setTimeout(() => {
            if (!cancelled) {
              setSyncedUserId(userId)
            }
          }, 100)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSyncError(getConvexErrorMessage(error, "Unable to sync your account."))
        }
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, syncedUserId, upsertCurrentUser, userId, isClerkLoaded])

  if (isClerkLoaded && !userId) {
    return <PlatformShell displayName="Guest" canAccessAdmin={false}>{children}</PlatformShell>
  }

  const fallbackDisplayName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Member"

  if (isClerkLoaded && userId && !isLoading && !isAuthenticated) {
    return <PlatformShell displayName={fallbackDisplayName} canAccessAdmin={false}>{children}</PlatformShell>
  }

  if (syncError) {
    return <PlatformShell displayName={fallbackDisplayName} canAccessAdmin={false}>{children}</PlatformShell>
  }

  if (isLoading || !isAuthenticated || syncedUserId !== userId || viewer === undefined) {
    return <PlatformLoadingShell message="Preparing your learning dashboard..." />
  }

  // viewer can be null if user doesn't exist yet, but that's OK after upsert succeeds
  const displayName =
    viewer?.name ??
    fallbackDisplayName

  return <PlatformShell displayName={displayName} canAccessAdmin={Boolean(viewer?.isMaintainer)}>{children}</PlatformShell>
}

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (!authEnabled) {
    return <PlatformShell displayName="Guest" canAccessAdmin={false}>{children}</PlatformShell>
  }

  return <AuthenticatedPlatformLayout>{children}</AuthenticatedPlatformLayout>
}
