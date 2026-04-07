"use client"

import { startTransition, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { Button, buttonVariants } from "@/components/ui/button"
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
    const ids = [...chapters.map((chapter) => chapter._id)]
    ;[ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]]
    await reorderChapters({ courseId: courseId as never, chapterIds: ids as never })
    startTransition(() => router.refresh())
  }

  async function moveLesson(lessonId: string, direction: -1 | 1) {
    const ids = chapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson._id))
    const currentIndex = ids.findIndex((id) => id === lessonId)
    const nextIndex = currentIndex + direction
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ids.length) return
    ;[ids[currentIndex], ids[nextIndex]] = [ids[nextIndex], ids[currentIndex]]
    await reorderLessons({ courseId: courseId as never, lessonIds: ids as never })
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} placeholder="Create a chapter" />
          <Button onClick={handleCreateChapter} className="rounded-full">Add Chapter</Button>
        </div>
        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </section>

      <div className="space-y-4">
        {chapters.map((chapter, index) => (
          <section key={chapter._id} className="rounded-[1.75rem] border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight">{chapter.isDefault ? "Default Chapter" : chapter.title}</h2>
                  {chapter.isDefault ? <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">Flat course layer</span> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {chapter.description || (chapter.isDefault ? "This hidden chapter lets learner pages render a clean Antonio-style lesson list." : "No chapter description yet.")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => moveChapter(index, -1)}>Move Up</Button>
                <Button variant="outline" className="rounded-full" onClick={() => moveChapter(index, 1)}>Move Down</Button>
                <Button className="rounded-full" onClick={() => handleCreateLesson(chapter._id)}>Add Lesson</Button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {chapter.lessons.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed bg-muted/30 p-5 text-sm text-muted-foreground">
                  No lessons in this chapter yet.
                </div>
              ) : (
                chapter.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson._id} className="flex flex-col gap-3 rounded-[1.25rem] border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">LESSON {lessonIndex + 1}</p>
                      <p className="mt-1 text-lg font-semibold">{lesson.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Mux status: {lesson.muxStatus}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="rounded-full" onClick={() => moveLesson(lesson._id, -1)}>Up</Button>
                      <Button variant="outline" className="rounded-full" onClick={() => moveLesson(lesson._id, 1)}>Down</Button>
                      <Link href={`/app/admin/courses/${courseId}/resources?lessonId=${lesson._id}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>
                        Resources
                      </Link>
                      <Link href={`/app/admin/courses/${courseId}/lessons/${lesson._id}`} className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>
                        Edit Lesson
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
