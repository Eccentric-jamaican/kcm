"use client"

import { startTransition, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/convex-api"
import { cn } from "@/lib/utils"

type Chapter = {
  _id: string
  title: string
  description: string
  isDefault: boolean
  lessons: Array<{
    _id: string
    title: string
    slug: string
    muxStatus: string
  }>
}

const muxDot: Record<string, string> = {
  ready: "bg-kcm-green",
  processing: "bg-kcm-silver",
  uploading: "bg-kcm-silver",
  errored: "bg-kcm-red",
  idle: "bg-muted-foreground/30",
}

export function CurriculumBuilder({
  courseId,
  chapters,
}: {
  courseId: string
  chapters: Chapter[]
}) {
  const router = useRouter()
  const createChapter = useMutation(api.admin.createChapter)
  const createLesson = useMutation(api.admin.createLesson)
  const reorderChapters = useMutation(api.admin.reorderChapters)
  const reorderLessons = useMutation(api.admin.reorderLessons)
  const [chapterTitle, setChapterTitle] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  async function handleCreateChapter() {
    if (!chapterTitle.trim()) return
    await createChapter({ courseId: courseId as never, title: chapterTitle.trim() })
    setChapterTitle("")
    setMessage("Chapter added.")
    startTransition(() => router.refresh())
  }

  async function handleCreateLesson(chapterId: string) {
    const title = window.prompt("Lesson title")
    if (!title?.trim()) return
    const lessonId = await createLesson({
      courseId: courseId as never,
      chapterId: chapterId as never,
      title: title.trim(),
    })
    startTransition(() => router.push(`/app/admin/courses/${courseId}/lessons/${lessonId}`))
  }

  async function moveChapter(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= chapters.length) return
    const ids = [...chapters.map((c) => c._id)]
    ;[ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]]
    await reorderChapters({ courseId: courseId as never, chapterIds: ids as never })
    startTransition(() => router.refresh())
  }

  async function moveLesson(lessonId: string, direction: -1 | 1) {
    const ids = chapters.flatMap((c) => c.lessons.map((l) => l._id))
    const i = ids.findIndex((id) => id === lessonId)
    const j = i + direction
    if (i < 0 || j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    await reorderLessons({ courseId: courseId as never, lessonIds: ids as never })
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-5">
      {/* Add chapter — compact inline */}
      <div className="flex items-center gap-2">
        <Input
          value={chapterTitle}
          onChange={(e) => setChapterTitle(e.target.value)}
          placeholder="New chapter name…"
          className="h-8 max-w-xs text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleCreateChapter()}
        />
        <Button onClick={handleCreateChapter} size="sm" variant="outline" className="h-8 rounded-lg text-xs">Add Chapter</Button>
        {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        {chapters.map((chapter, idx) => (
          <section key={chapter._id}>
            {/* Chapter header */}
            <div className="flex items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">{chapter.isDefault ? "Default Chapter" : chapter.title}</h2>
                {chapter.isDefault ? (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">flat layer</span>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveChapter(idx, -1)} className="flex h-6 w-6 items-center justify-center rounded text-xs text-muted-foreground transition-colors hover:bg-muted" aria-label="Move up">↑</button>
                <button type="button" onClick={() => moveChapter(idx, 1)} className="flex h-6 w-6 items-center justify-center rounded text-xs text-muted-foreground transition-colors hover:bg-muted" aria-label="Move down">↓</button>
                <Button size="sm" variant="ghost" className="h-6 rounded px-2 text-xs" onClick={() => handleCreateLesson(chapter._id)}>+ Lesson</Button>
              </div>
            </div>

            {/* Lessons — horizontal scroll strip */}
            {chapter.lessons.length === 0 ? (
              <p className="py-3 text-xs text-muted-foreground">No lessons yet.</p>
            ) : (
              <div className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {chapter.lessons.map((lesson, li) => (
                  <div
                    key={lesson._id}
                    className="group flex w-[260px] shrink-0 snap-start items-center justify-between rounded-xl border bg-card px-3.5 py-2.5 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", muxDot[lesson.muxStatus] ?? muxDot.idle)} />
                        <p className="truncate text-sm font-medium">{lesson.title}</p>
                      </div>
                      <p className="mt-0.5 pl-3.5 text-[11px] text-muted-foreground">{lesson.muxStatus}</p>
                    </div>
                    <div className="ml-2 flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button type="button" onClick={() => moveLesson(lesson._id, -1)} className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-muted-foreground hover:bg-muted" aria-label="Move left">←</button>
                      <button type="button" onClick={() => moveLesson(lesson._id, 1)} className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-muted-foreground hover:bg-muted" aria-label="Move right">→</button>
                      <Link href={`/app/admin/courses/${courseId}/lessons/${lesson._id}`} className="flex h-5 items-center rounded px-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Edit</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
