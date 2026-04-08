import Link from "next/link"
import { forbidden, notFound, redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { buttonVariants } from "@/components/ui/button-variants"
import { api } from "@/lib/convex-api"
import { ensureConvexViewer, getConvexServerToken } from "@/lib/convex-server"
import { isForbiddenError, isNotAuthenticatedError } from "@/lib/convex-route-errors"
import { cn } from "@/lib/utils"
import { CourseShareButton } from "../../components/course-share-button"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const token = await getConvexServerToken()

  if (token) {
    await ensureConvexViewer(token)
  }

  let data

  try {
    data = await fetchQuery(
      api.courses.getCourseBySlugForViewer,
      { slug: courseId },
      token ? { token } : undefined,
    )
  } catch (error) {
    if (isNotAuthenticatedError(error)) {
      redirect(`/sign-in?redirect_url=${encodeURIComponent(`/app/courses/${courseId}`)}`)
    }
    if (isForbiddenError(error)) {
      forbidden()
    }
    throw error
  }

  if (!data) {
    notFound()
  }

  const courseUrl = `/app/courses/${data.course.slug}`
  const flatLessons = data.chapters.flatMap((chapter) => chapter.lessons)

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1040px]">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_304px] lg:items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm text-foreground/80">Course</p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
                {data.course.title}
              </h1>
              <p className="max-w-3xl text-2xl leading-relaxed text-muted-foreground">
                {data.course.subtitle || data.course.description}
              </p>
            </div>

            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">CREATED BY</p>
              <div className="mt-3 flex items-start gap-4">
                <img
                  src="https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_96/f_auto/q_100/v1760621497/antonio-thumbs-up_2x_r4upxk?_a=BAVAZGAQ0"
                  alt="Instructor"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <p className="text-2xl font-medium leading-none">KCM Maintainer</p>
                  <p className="mt-2 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    KCM&apos;s private curriculum is delivered lesson-by-lesson with the same focused learning flow you&apos;d expect from a modern course platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {data.firstLessonSlug ? (
                <Link
                  href={`/app/courses/${data.course.slug}/${data.firstLessonSlug}`}
                  className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-xl px-6 text-base")}
                >
                  Start Learning
                </Link>
              ) : null}
              {data.course.githubUrl ? (
                <a
                  href={data.course.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-xl px-6 text-base")}
                >
                  Code
                </a>
              ) : null}
              <CourseShareButton title={data.course.title} url={courseUrl} />
            </div>

            <div className="space-y-4 pt-6">
              <p className="text-sm text-foreground/80">OVERVIEW</p>
              <p className="max-w-4xl text-xl leading-relaxed text-muted-foreground">{data.course.description}</p>
              <p className="max-w-4xl whitespace-pre-wrap text-xl leading-relaxed text-muted-foreground">{data.course.body}</p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24" style={{ width: '301px' }}>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative aspect-video w-full">
                {data.course.coverImageUrl ? (
                  <img
                    src={data.course.coverImageUrl}
                    alt={data.course.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(27,156,72,0.2),transparent_45%),linear-gradient(180deg,#fafaf8,white)]" />
                )}
              </div>
              <div className="divide-y divide-border">
                {flatLessons.map((lesson, index) => (
                  <Link
                    key={lesson._id}
                    href={`/app/courses/${data.course.slug}/${lesson.slug}`}
                    className="flex items-center gap-4 px-5 py-4 text-base transition-colors hover:bg-muted/60"
                  >
                    <span className="text-sm text-muted-foreground">{index + 1}</span>
                    <span className="font-medium">{lesson.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
