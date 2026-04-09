"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/lib/convex-api"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"

type LessonNavItem = {
  _id: string
  title: string
  slug: string
}

function SidebarLessonList({
  courseSlug,
  lessons,
  currentLessonId,
  collapsed = false,
  onNavigate,
}: {
  courseSlug: string
  lessons: LessonNavItem[]
  currentLessonId: string
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <div className="divide-y divide-border">
      {lessons.map((lesson, index) => {
        const isActive = lesson._id === currentLessonId

        return (
          <Link
            key={lesson._id}
            href={`/app/courses/${courseSlug}/${lesson.slug}`}
            onClick={onNavigate}
            className={`flex items-center transition-colors ${
              collapsed ? "justify-center px-2 py-3 text-center" : "gap-4 px-5 py-4"
            } ${
              isActive
                ? "text-blue-600"
                : "text-foreground hover:bg-muted/60"
            }`}
            title={collapsed ? lesson.title : undefined}
          >
            <span className="shrink-0 text-sm text-muted-foreground">{index + 1}</span>
            {!collapsed ? <span className="font-medium">{lesson.title}</span> : null}
          </Link>
        )
      })}
    </div>
  )
}

export function CourseLessonSidebar({
  courseSlug,
  courseTitle,
  coverImageUrl,
  currentLessonId,
  lessons,
}: {
  courseSlug: string
  courseTitle: string
  coverImageUrl: string | null
  currentLessonId: string
  lessons: LessonNavItem[]
}) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem("courseLessonSidebarCollapsed") === "true"
  })
  const [localAutoplay, setLocalAutoplay] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem("courseLessonAutoplay") === "true"
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const playbackPreferences = useQuery(api.progress.getUserPlaybackPreferences)
  const setUserPlaybackPreferences = useMutation(api.progress.setUserPlaybackPreferences)
  const autoplay = playbackPreferences?.autoplayNextLesson ?? localAutoplay

  useEffect(() => {
    window.localStorage.setItem("courseLessonSidebarCollapsed", String(collapsed))
  }, [collapsed])

  useEffect(() => {
    window.localStorage.setItem("courseLessonAutoplay", String(autoplay))
  }, [autoplay])

  async function handleAutoplayChange(nextValue: boolean) {
    const previousValue = autoplay
    setLocalAutoplay(nextValue)
    try {
      await setUserPlaybackPreferences({ autoplayNextLesson: nextValue })
    } catch {
      setLocalAutoplay(previousValue)
    }
  }

  return (
    <>
      {/* Floating Lessons button for mobile */}
      <button
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded bg-card/90 border border-foreground/10 px-3 py-2 text-sm font-normal shadow-sm backdrop-blur-sm lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        Lessons
      </button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[311px] p-0">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b p-5">
              <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">Workshop Contents</p>
              <div className="flex items-start gap-3">
                {coverImageUrl ? (
                  <Link href={`/app/courses/${courseSlug}`} onClick={() => setMobileOpen(false)} className="block shrink-0 overflow-hidden rounded-lg">
                    <img src={coverImageUrl} alt={courseTitle} className="h-14 w-14 object-cover" />
                  </Link>
                ) : null}
                <div className="flex-1 min-w-0">
                  <Link href={`/app/courses/${courseSlug}`} onClick={() => setMobileOpen(false)} className="block font-semibold leading-tight hover:text-primary">
                    {courseTitle}
                  </Link>
                  <div className="mt-2 flex items-center gap-2">
                    <Switch checked={autoplay} onCheckedChange={handleAutoplayChange} />
                    <p className="text-sm font-medium">Autoplay</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson list */}
            <div className="flex-1 overflow-y-auto">
              <SidebarLessonList
                courseSlug={courseSlug}
                lessons={lessons}
                currentLessonId={currentLessonId}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen bg-background transition-[width] duration-200 lg:block ${
          collapsed ? "w-[88px]" : "w-[320px]"
        }`}
      >
        <nav className="h-full overflow-hidden">
          {!collapsed ? (
            <div className="flex h-full flex-col">
              {/* Header with image, title, and autoplay */}
              <div className="border-b bg-card p-5">
                <div className="flex items-start gap-3">
                  {coverImageUrl ? (
                    <Link href={`/app/courses/${courseSlug}`} className="block shrink-0 overflow-hidden rounded-lg">
                      <img src={coverImageUrl} alt={courseTitle} className="h-14 w-14 object-cover" />
                    </Link>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <Link href={`/app/courses/${courseSlug}`} className="block font-semibold leading-tight hover:text-primary">
                      {courseTitle}
                    </Link>
                    <div className="mt-2 flex items-center gap-2">
                      <Switch checked={autoplay} onCheckedChange={handleAutoplayChange} />
                      <p className="text-sm font-medium">Autoplay</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 rounded-full"
                    onClick={() => setCollapsed((value) => !value)}
                    aria-label="Collapse sidebar"
                  >
                    {"<"}
                  </Button>
                </div>
              </div>

              {/* Lesson list */}
              <div className="flex-1 overflow-y-auto">
                <SidebarLessonList
                  courseSlug={courseSlug}
                  lessons={lessons}
                  currentLessonId={currentLessonId}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center pt-4">
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setCollapsed((value) => !value)}
                aria-label="Expand sidebar"
              >
                {">"}
              </Button>
              <div className="flex-1 overflow-y-auto py-4">
                <SidebarLessonList
                  courseSlug={courseSlug}
                  lessons={lessons}
                  currentLessonId={currentLessonId}
                  collapsed
                />
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}
