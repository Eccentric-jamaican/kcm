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
    <div className="flex flex-col">
      {lessons.map((lesson, index) => {
        const isActive = lesson._id === currentLessonId

        return (
          <Link
            key={lesson._id}
            href={`/app/courses/${courseSlug}/${lesson.slug}`}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-foreground hover:bg-muted/50"
            }`}
            title={collapsed ? lesson.title : undefined}
          >
            <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{index + 1}</span>
            {!collapsed ? <span className="font-medium leading-snug">{lesson.title}</span> : null}
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
    // Update CSS custom property for the main content area
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '32px' : '320px')
  }, [collapsed])

  // Set initial CSS custom property on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '32px' : '320px')
  }, [])

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
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-card/90 border border-foreground/10 px-3 py-2 text-sm font-normal shadow-lg backdrop-blur-md lg:hidden"
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
        <SheetContent side="left" className="w-[320px] p-0">
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

      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen border-r border-b bg-card transition-all duration-200 lg:block ${
          collapsed ? "w-8" : "w-[320px]"
        }`}
      >
        <nav 
          aria-label="Module navigation" 
          className={`h-full overflow-hidden transition-all duration-200 ${
            collapsed ? "w-8" : "w-[320px]"
          }`}
        >
          {!collapsed ? (
            <div className="flex h-full flex-col">
              {/* Header with image, title, and autoplay */}
              <div className="relative border-b p-5">
                <button
                  className="absolute right-1.5 top-1.5 z-50 flex size-8 items-center justify-center rounded-md p-1 transition hover:bg-accent"
                  onClick={() => setCollapsed(true)}
                  aria-label="Collapse sidebar"
                  aria-expanded="true"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <path d="M9 3v18"></path>
                    <path d="m16 15-3-3 3-3"></path>
                  </svg>
                </button>
                <div className="flex items-start gap-3">
                  {coverImageUrl ? (
                    <Link href={`/app/courses/${courseSlug}`} className="relative mb-2 aspect-video w-24 shrink-0 overflow-hidden rounded-sm">
                      <img src={coverImageUrl} alt={courseTitle} className="absolute inset-0 h-full w-full object-cover" />
                    </Link>
                  ) : null}
                  <div className="flex-1 min-w-0 pr-8">
                    <Link href={`/app/courses/${courseSlug}`} className="block text-sm font-semibold leading-tight hover:text-primary">
                      {courseTitle}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <Switch 
                        checked={autoplay} 
                        onCheckedChange={handleAutoplayChange}
                        className="scale-90 origin-left"
                      />
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
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center">
              <button
                className="flex size-8 items-center justify-center transition hover:bg-accent"
                onClick={() => setCollapsed(false)}
                aria-label="Open sidebar"
                aria-expanded="false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <path d="M9 3v18"></path>
                  <path d="m14 9 3 3-3 3"></path>
                </svg>
              </button>
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
