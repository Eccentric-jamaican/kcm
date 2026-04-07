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
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section className="rounded-[2rem] border bg-background p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">MAINTAINER PREVIEW</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">{data.course.title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{data.course.description}</p>
            </div>
            <a href={`/app/courses/${data.course.slug}`} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>
              Open Learner Page
            </a>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[1.75rem] border bg-card shadow-sm">
              {data.course.coverImageUrl ? (
                <img src={data.course.coverImageUrl} alt={data.course.title} className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video w-full bg-[radial-gradient(circle_at_top_left,rgba(27,156,72,0.2),transparent_45%),linear-gradient(180deg,#fafaf8,white)]" />
              )}
            </div>
            <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
              <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-muted-foreground">{data.course.body}</p>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border bg-card p-5 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">Lesson Navigation</h2>
            <div className="mt-5 space-y-4">
              {data.chapters.map((chapter) => (
                <div key={chapter._id}>
                  {!chapter.isDefault ? <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">{chapter.title}</p> : null}
                  <div className="mt-2 space-y-2">
                    {chapter.lessons.map((lesson, index) => (
                      <div key={lesson._id} className="rounded-[1rem] border px-3 py-3">
                        <p className="text-sm font-semibold">{index + 1}. {lesson.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{lesson.state} • {lesson.muxStatus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
