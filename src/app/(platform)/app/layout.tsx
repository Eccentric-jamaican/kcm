"use client"

import { UserButton, useAuth, useUser } from "@clerk/nextjs"
import { useConvexAuth, useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"
import { api } from "../../../../convex/_generated/api"

const authEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CONVEX_URL
)

function PlatformHeader({ displayName }: { displayName: string }) {
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

          <div className="inline-flex items-center gap-3 rounded-full px-1 py-1">
            <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
            <UserButton />
          </div>
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

function PlatformLoadingShell({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f2f4] px-6">
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
}: Readonly<{
  children: React.ReactNode
  displayName: string
}>) {
  return (
    <div className="min-h-screen bg-[#f2f2f4]">
      <PlatformHeader displayName={displayName} />
      <div className="mx-auto w-full max-w-[1400px]">{children}</div>
    </div>
  )
}

function AuthenticatedPlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { userId } = useAuth()
  const { user } = useUser()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const upsertCurrentUser = useMutation(api.users.upsertCurrentUser)
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : "skip")
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setSyncedUserId(null)
      setSyncError(null)
      return
    }

    if (syncedUserId === userId) {
      return
    }

    let cancelled = false

    setSyncError(null)

    upsertCurrentUser({})
      .then(() => {
        if (!cancelled) {
          setSyncedUserId(userId)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSyncError(error instanceof Error ? error.message : "Unable to sync your account.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, syncedUserId, upsertCurrentUser, userId])

  if (syncError) {
    return <PlatformLoadingShell message={syncError} />
  }

  if (isLoading || !isAuthenticated || syncedUserId !== userId || viewer === undefined || viewer === null) {
    return <PlatformLoadingShell message="Preparing your learning dashboard..." />
  }

  const displayName =
    viewer.name ??
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Member"

  return <PlatformShell displayName={displayName}>{children}</PlatformShell>
}

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (!authEnabled) {
    return <PlatformShell displayName="Guest">{children}</PlatformShell>
  }

  return <AuthenticatedPlatformLayout>{children}</AuthenticatedPlatformLayout>
}
