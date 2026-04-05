"use client"

import Link from "next/link"
import * as React from "react"
import { usePaginatedQuery, useQuery } from "convex/react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { api } from "../../../../../convex/_generated/api"
import { Doc, Id } from "../../../../../convex/_generated/dataModel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlayIcon } from "@hugeicons/core-free-icons"

const categories = [
  "Weekly Market Review",
  "Strategy Sessions",
  "Q&A / Ask Me Anything",
] as const

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export default function WebinarsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get filter values from URL
  const yearParam = searchParams.get("year")
  const monthParam = searchParams.get("month")
  const categoryParam = searchParams.get("category")

  // Parse and validate year/month params
  const parsedYear = yearParam ? parseInt(yearParam, 10) : NaN
  const parsedMonth = monthParam ? parseInt(monthParam, 10) : NaN
  
  const year = Number.isFinite(parsedYear) ? parsedYear : undefined
  const month = Number.isFinite(parsedMonth) ? parsedMonth : undefined
  const category = categoryParam 
    ? (categoryParam as (typeof categories)[number]) 
    : undefined

  // Fetch webinars with filters (paginated)
  const {
    results: webinars,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.webinars.listWebinars,
    {
      year,
      month,
      category,
    },
    { initialNumItems: 50 }
  )

  // Fetch available years for dropdown
  const availableYears = useQuery(api.webinars.getAvailableYears, {})

  // Fetch available months when year is selected
  const availableMonths = useQuery(
    api.webinars.getAvailableMonthsForYear,
    year !== undefined ? { year } : "skip"
  )

  // Update URL params
  const updateFilters = (updates: {
    year?: string | null
    month?: string | null
    category?: string | null
  }) => {
    const params = new URLSearchParams(searchParams)

    if (updates.year !== undefined) {
      if (updates.year) {
        params.set("year", updates.year)
      } else {
        params.delete("year")
        // Also clear month when clearing year
        params.delete("month")
      }
    }

    if (updates.month !== undefined) {
      if (updates.month) {
        params.set("month", updates.month)
      } else {
        params.delete("month")
      }
    }

    if (updates.category !== undefined) {
      if (updates.category) {
        params.set("category", updates.category)
      } else {
        params.delete("category")
      }
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const isLoading = status === "LoadingFirstPage"

  // Get months to display (only show if year is selected)
  const monthsToDisplay =
    year !== undefined && availableMonths
      ? months.filter((m) => availableMonths.includes(parseInt(m.value, 10)))
      : []

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-4xl font-semibold tracking-tight">Past Webinars</h1>
          <p className="mt-2 text-muted-foreground">
            Watch recordings of our live trading sessions, strategy breakdowns, and Q&A events.
          </p>
        </section>

        {/* Filters */}
        <section className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <Select
            value={yearParam ?? "all"}
            onValueChange={(value) =>
              updateFilters({ year: value === "all" ? null : value })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears?.map((y: number) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month Filter */}
          <Select
            value={monthParam ?? "all"}
            onValueChange={(value) =>
              updateFilters({ month: value === "all" ? null : value })
            }
            disabled={year === undefined || monthsToDisplay.length === 0}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {monthsToDisplay.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={categoryParam ?? "all"}
            onValueChange={(value) =>
              updateFilters({ category: value === "all" ? null : value })
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Webinars Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="size-6" />
          </div>
        ) : webinars.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            <p className="text-lg font-medium">No webinars found</p>
            <p className="mt-1">
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {webinars.map((webinar: Doc<"webinars">) => (
              <Link
                key={webinar._id}
                href={`/app/webinars/${webinar._id}`}
                className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={webinar.thumbnailUrl}
                    alt={webinar.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
                      <HugeiconsIcon icon={PlayIcon} className="h-6 w-6" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                    {formatDuration(webinar.duration)}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 p-4">
                  {/* Category badge */}
                  <span className="inline-block rounded-full bg-bull/10 px-2.5 py-0.5 text-xs font-medium text-bull">
                    {webinar.category}
                  </span>

                  <h3 className="line-clamp-2 text-xl font-semibold leading-tight">
                    {webinar.title}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {webinar.presenter} • {formatDate(webinar.date)}
                  </p>

                  {/* Tags */}
                  {webinar.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {webinar.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80"
                        >
                          {tag}
                        </span>
                      ))}
                      {webinar.tags.length > 3 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/60">
                          +{webinar.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
