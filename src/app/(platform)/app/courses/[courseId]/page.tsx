import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { buttonVariants } from "@/components/ui/button-variants"
import { api } from "@/lib/convex-api"
import { getConvexServerToken } from "@/lib/convex-server"
import { cn } from "@/lib/utils"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const token = await getConvexServerToken()
  const data = token ? await fetchQuery(api.courses.getPublishedCourseBySlug, { slug: courseId }, { token }) : null

  if (!data) {
    notFound()
  }

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">COURSE</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight">{data.course.title}</h1>
          <h2 className="max-w-3xl text-xl text-muted-foreground">{data.course.subtitle}</h2>

          <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
            <img
              src="https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_96/f_auto/q_100/v1760621497/antonio-thumbs-up_2x_r4upxk?_a=BAVAZGAQ0"
              alt="Instructor"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">CREATED BY</p>
              <p className="text-sm font-semibold">KCM Maintainer</p>
              <p className="text-sm text-muted-foreground">
                This page is now rendered from the Convex-backed course model and keeps the Antonio-inspired lesson-first flow.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {data.firstLessonSlug ? (
              <Link href={`/app/courses/${data.course.slug}/${data.firstLessonSlug}`} className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>Start Watching</Link>
            ) : null}
            {data.course.githubUrl ? (
              <a href={data.course.githubUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>Code</a>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">OVERVIEW</p>
            <div className="overflow-hidden rounded-xl border bg-black/90">
              {data.course.coverImageUrl ? (
                <img src={data.course.coverImageUrl} alt={data.course.title} className="aspect-video w-full object-cover opacity-90" />
              ) : (
                <div className="aspect-video w-full bg-[radial-gradient(circle_at_top_left,rgba(27,156,72,0.2),transparent_45%),linear-gradient(180deg,#0f172a,#111827)]" />
              )}
            </div>
            <p className="text-base text-muted-foreground">{data.course.description}</p>
            <p className="whitespace-pre-wrap text-base text-muted-foreground">{data.course.body}</p>
          </div>
        </section>

        <aside className="h-fit rounded-xl border bg-card p-3 lg:sticky lg:top-6">
          {data.course.coverImageUrl ? (
            <img src={data.course.coverImageUrl} alt={data.course.title} className="aspect-video w-full rounded-lg object-cover" />
          ) : null}
          <div className="mt-3 space-y-4">
            {data.chapters.map((chapter) => (
              <div key={chapter._id}>
                {!chapter.isDefault ? (
                  <p className="px-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground">{chapter.title}</p>
                ) : null}
                <div className="mt-2 space-y-1">
                  {chapter.lessons.map((lesson: (typeof chapter.lessons)[number], index: number) => (
                    <Link
                      key={lesson._id}
                      href={`/app/courses/${data.course.slug}/${lesson.slug}`}
                      className="block rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      {index + 1}. {lesson.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
