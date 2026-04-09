import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/lib/convex-api"
import { getConvexServerToken } from "@/lib/convex-server"
import { parseCourseBody } from "@/lib/course-body"
import { LessonProgressToggle } from "../../../components/lesson-progress-toggle"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonSlug: string }>
}) {
  const { courseId, lessonSlug } = await params
  const token = await getConvexServerToken()
  const data = token
    ? await fetchQuery(api.courses.getPublishedLessonBySlug, { courseSlug: courseId, lessonSlug }, { token })
    : null

  if (!data) {
    notFound()
  }

  const blocks = parseCourseBody(data.lesson.body)
  const videoResource = data.resources.find((resource: (typeof data.resources)[number]) => resource.type === "video")
  const lessonUrl = videoResource?.url || (data.lesson.muxPlaybackId ? `https://stream.mux.com/${data.lesson.muxPlaybackId}.m3u8` : null)

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#f2f2f4]">
      <div className="mx-auto grid max-w-[1600px] gap-0 lg:grid-cols-[320px_1fr]">
        <aside className="border-r bg-background">
          <div className="sticky top-20 space-y-4 p-4">
            <Link href={`/app/courses/${data.course.slug}`} className="block overflow-hidden rounded-[1.25rem] border">
              {data.course.coverImageUrl ? <img src={data.course.coverImageUrl} alt={data.course.title} className="aspect-video w-full object-cover" /> : null}
            </Link>
            <div>
              <p className="text-xl font-semibold tracking-tight">{data.course.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">Autoplay is UI-only for now, but lesson order and completion are fully wired.</p>
            </div>
            <div className="space-y-2">
              {data.chapters.flatMap((chapter) => chapter.lessons).map((lesson, index) => {
                const isActive = lesson._id === data.lesson._id
                return (
                  <Link
                    key={lesson._id}
                    href={`/app/courses/${data.course.slug}/${lesson.slug}`}
                    className={`block rounded-[1rem] px-3 py-3 text-sm transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "border bg-card hover:bg-muted"
                    }`}
                  >
                    {index + 1}. {lesson.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>

        <section className="space-y-6 p-4 sm:p-6">
          <div className="overflow-hidden rounded-[1.75rem] border bg-black shadow-sm">
            {lessonUrl ? (
              <video
                controls
                preload="metadata"
                poster={data.course.coverImageUrl ?? undefined}
                className="aspect-video w-full bg-black object-cover"
                src={lessonUrl}
              />
            ) : data.course.coverImageUrl ? (
              <img src={data.course.coverImageUrl} alt={data.lesson.title} className="aspect-video w-full object-cover" />
            ) : (
              <div className="aspect-video w-full bg-black" />
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-[1.75rem] border bg-background p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">LESSON</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">{data.lesson.title}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.lesson.githubUrl ? (
                <Link href={data.lesson.githubUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition-colors hover:bg-muted">
                  Source Code
                </Link>
              ) : null}
              <LessonProgressToggle courseId={data.course._id} lessonId={data.lesson._id} completed={Boolean(data.progress?.completed)} />
              {data.navigation.nextLesson ? (
                <Link href={`/app/courses/${data.course.slug}/${data.navigation.nextLesson.slug}`} className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Next Lesson
                </Link>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.75rem] border bg-background p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">Transcript</h2>
            <div className="mt-6 space-y-4">
              {blocks.map((block, index) =>
                block.type === "timestamp" ? (
                  <div key={`${block.time}-${index}`} className="grid gap-3 rounded-[1.25rem] border p-4 md:grid-cols-[100px_1fr]">
                    <div className="text-sm font-semibold">{block.time}</div>
                    <p className="text-sm leading-7 text-muted-foreground">{block.text}</p>
                  </div>
                ) : (
                  <p key={index} className="text-sm leading-7 text-muted-foreground">
                    {block.text}
                  </p>
                ),
              )}
            </div>
          </div>

          {data.navigation.nextLesson ? (
            <nav className="rounded-[1.75rem] border bg-background p-6 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">UP NEXT</p>
              <Link href={`/app/courses/${data.course.slug}/${data.navigation.nextLesson.slug}`} className="mt-3 flex items-center justify-between gap-4 rounded-[1.25rem] border p-4 transition-colors hover:bg-muted">
                <div>
                  <p className="text-lg font-semibold">{data.navigation.nextLesson.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Continue through the course sequence.</p>
                </div>
                <span className="text-sm font-medium">Open</span>
              </Link>
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  )
}
