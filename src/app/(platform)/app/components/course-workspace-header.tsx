"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"

export function CourseWorkspaceHeader() {
  const { user } = useUser()
  const displayName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Member"

  return (
    <header className="border-b bg-background">
      <div className="flex h-[77px] items-center gap-6 px-6">
        <Link
          href="/app/browse"
          className="flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-foreground"
        >
          Browse
          <span className="text-xs">▾</span>
        </Link>

        <div className="max-w-md flex-1">
          <label className="relative block">
            <HugeiconsIcon
              icon={SearchIcon}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="What do you want to learn today?"
              className="h-11 rounded-full border-input bg-background pl-9"
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-5">
          <Link
            href="/app/browse"
            className="text-sm font-medium text-foreground transition-colors hover:text-foreground"
          >
            Feedback
          </Link>
          <div className="inline-flex items-center gap-2">
            <span className="hidden text-sm font-medium lg:inline">{displayName}</span>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  )
}
