import Link from "next/link"
import { forbidden, notFound, redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { buttonVariants } from "@/components/ui/button-variants"
import { api } from "@/lib/convex-api"
import { ensureConvexViewer, getConvexServerToken } from "@/lib/convex-server"
import { isForbiddenError, isNotAuthenticatedError } from "@/lib/convex-route-errors"
import { cn } from "@/lib/utils"
import { CourseShareButton } from "../../components/course-share-button"

// Icons
const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

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
      <div className="mx-auto max-w-[1200px]">
        <section className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Content - 8 columns */}
          <div className="space-y-8 lg:col-span-8">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Course</p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {data.course.title}
              </h1>
              <p className="max-w-3xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
                {data.course.subtitle || data.course.description}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">Created by</p>
              <div className="mt-3 flex items-start gap-3">
                <img
                  src="https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_96/f_auto/q_100/v1760621497/antonio-thumbs-up_2x_r4upxk?_a=BAVAZGAQ0"
                  alt="Instructor"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div>
                  <p className="text-lg font-medium">KCM Maintainer</p>
                  <p className="mt-1 max-w-xl text-base leading-relaxed text-muted-foreground">
                    KCM&apos;s private curriculum is delivered lesson-by-lesson with the same focused learning flow you&apos;d expect from a modern course platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {data.firstLessonSlug ? (
                <Link
                  href={`/app/courses/${data.course.slug}/${data.firstLessonSlug}`}
                  className={cn(buttonVariants({ variant: "default", size: "lg" }), "h-12 rounded-xl bg-kcm-red px-6 text-base hover:bg-kcm-red/90")}
                >
                  Start Learning
                </Link>
              ) : null}
              {data.course.githubUrl ? (
                <a
                  href={data.course.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex h-12 items-center gap-2 rounded-xl px-6 text-base")}
                >
                  <GitHubIcon />
                  Code
                </a>
              ) : null}
              <CourseShareButton title={data.course.title} url={courseUrl} />
            </div>

            <div className="space-y-4 pt-6">
              <p className="text-sm text-muted-foreground uppercase">Overview</p>
              <p className="max-w-4xl text-lg leading-relaxed text-muted-foreground">{data.course.description}</p>
              <p className="max-w-4xl whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">{data.course.body}</p>
            </div>
          </div>

          {/* Sidebar - 4 columns */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {/* Course cover image - aspect-video (16:9) */}
              <div className="relative aspect-video w-full overflow-hidden">
                {data.course.coverImageUrl ? (
                  <img
                    src={data.course.coverImageUrl}
                    alt={data.course.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-kcm-red/20 to-kcm-burgundy/20" />
                )}
              </div>
              {/* Lesson list */}
              <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
                <nav className="flex flex-col">
                  {flatLessons.map((lesson, index) => (
                    <Link
                      key={lesson._id}
                      href={`/app/courses/${data.course.slug}/${lesson.slug}`}
                      className="group flex h-16 items-center gap-4 px-3 py-2 pr-10 text-sm transition-colors hover:bg-muted/50"
                    >
                      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="font-medium leading-snug">{lesson.title}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
