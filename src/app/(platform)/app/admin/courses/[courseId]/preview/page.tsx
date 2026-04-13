import { notFound } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { buttonVariants } from "@/components/ui/button-variants"
import { api } from "@/lib/convex-api"
import { requireConvexServerToken } from "@/lib/convex-server"
import { cn } from "@/lib/utils"

export default async function AdminCoursePreviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const token = await requireConvexServerToken()
  const data = await fetchQuery(api.admin.getCourseEditor, { courseId: courseId as never }, { token })

  if (!data) {
    notFound()
  }

  return (
    <main className="px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        {/* Page header — flat */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{data.course.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{data.course.description}</p>
          </div>
          <a href={`/app/courses/${data.course.slug}`} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm" }), "h-8 rounded-lg text-xs")}>
            Open Learner Page
          </a>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left — cover + overview */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border bg-muted">
              {data.course.coverImageUrl ? (
                <img src={data.course.coverImageUrl} alt={data.course.title} className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video w-full bg-[radial-gradient(circle_at_top_left,rgba(204,0,0,0.15),transparent_45%),linear-gradient(180deg,#faf8f8,white)]" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold">Overview</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{data.course.body}</p>
            </div>
          </div>

          {/* Right — lesson list, compact rows */}
          <div>
            <h2 className="mb-3 text-sm font-semibold">Lesson Navigation</h2>
            <div className="divide-y rounded-xl border bg-card">
              {data.chapters.map((chapter) => (
                <div key={chapter._id}>
                  {!chapter.isDefault ? (
                    <p className="border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{chapter.title}</p>
                  ) : null}
                  {chapter.lessons.map((lesson, i) => (
                    <div key={lesson._id} className="flex items-center justify-between px-4 py-2.5">
                      <p className="text-sm">
                        <span className="mr-2 text-xs tabular-nums text-muted-foreground">{i + 1}.</span>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{lesson.state}</span>
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          lesson.muxStatus === "ready" && "bg-kcm-green",
                          lesson.muxStatus === "processing" && "bg-kcm-red/60",
                          lesson.muxStatus === "errored" && "bg-kcm-red",
                          !["ready", "processing", "errored"].includes(lesson.muxStatus) && "bg-muted-foreground/30",
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
