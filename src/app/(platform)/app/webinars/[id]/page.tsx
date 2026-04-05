"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import { Id } from "../../../../../../convex/_generated/dataModel"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeftIcon, ClockIcon, CalendarIcon, UserIcon } from "@hugeicons/core-free-icons"

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

function getYouTubeEmbedUrl(url: string): string {
  // Handle various YouTube URL formats
  const videoIdMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/
  )
  if (videoIdMatch) {
    return `https://www.youtube.com/embed/${videoIdMatch[1]}`
  }
  // If it's already an embed URL or other format, return as-is
  return url
}

export default function WebinarDetailPage() {
  const params = useParams()
  
  // Validate the route param
  const rawId = params.id
  const isValidId = typeof rawId === "string" && rawId.length > 0
  const webinarId = isValidId ? (rawId as Id<"webinars">) : undefined

  const webinar = useQuery(
    api.webinars.getWebinarById,
    webinarId !== undefined ? { id: webinarId } : "skip"
  )

  // Handle loading state or invalid ID
  if (!isValidId) {
    return (
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            <p className="text-lg font-medium">Invalid webinar ID</p>
            <p className="mt-1">The webinar ID provided is not valid.</p>
            <Link href="/app/webinars">
              <Button className="mt-4" variant="outline">
                <HugeiconsIcon icon={ArrowLeftIcon} className="mr-2 h-4 w-4" />
                Back to Webinars
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (webinar === undefined) {
    return (
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-center justify-center py-20">
            <Spinner className="size-6" />
          </div>
        </div>
      </main>
    )
  }

  if (webinar === null) {
    return (
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            <p className="text-lg font-medium">Webinar not found</p>
            <p className="mt-1">
              The webinar you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/app/webinars">
              <Button className="mt-4" variant="outline">
                <HugeiconsIcon icon={ArrowLeftIcon} className="mr-2 h-4 w-4" />
                Back to Webinars
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const embedUrl = getYouTubeEmbedUrl(webinar.videoUrl)

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Back button */}
        <Link
          href="/app/webinars"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeftIcon} className="h-4 w-4" />
          Back to Webinars
        </Link>

        {/* Video Player */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
          <iframe
            src={embedUrl}
            title={webinar.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Webinar Info */}
        <div className="space-y-4">
          {/* Category badge */}
          <span className="inline-block rounded-full bg-bull/10 px-3 py-1 text-sm font-medium text-bull">
            {webinar.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {webinar.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
              <span>{webinar.presenter}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={CalendarIcon} className="h-4 w-4" />
              <span>{formatDate(webinar.date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={ClockIcon} className="h-4 w-4" />
              <span>{formatDuration(webinar.duration)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {webinar.description}
          </p>

          {/* Tags */}
          {webinar.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {webinar.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
