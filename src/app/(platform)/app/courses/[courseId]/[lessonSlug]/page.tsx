import Link from "next/link"
import { forbidden, notFound, redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/lib/convex-api"
import { ensureConvexViewer, getConvexServerToken } from "@/lib/convex-server"
import { parseCourseBody } from "@/lib/course-body"
import { isForbiddenError, isNotAuthenticatedError } from "@/lib/convex-route-errors"
import { PrivateMuxPlayer } from "@/components/video/private-mux-player"
import { LessonTranscript } from "../../../components/lesson-transcript"
import { CourseLessonSidebar } from "../../../components/course-lesson-sidebar"
import { CourseWorkspaceHeader } from "../../../components/course-workspace-header"
import { LessonProgressToggle } from "../../../components/lesson-progress-toggle"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonSlug: string }>
}) {
  const { courseId, lessonSlug } = await params
  const token = await getConvexServerToken()

  if (token) {
    await ensureConvexViewer(token)
  }

  let data

  try {
    data = await fetchQuery(
      api.courses.getLessonBySlugForViewer,
      { courseSlug: courseId, lessonSlug },
      token ? { token } : undefined,
    )
  } catch (error) {
    if (isNotAuthenticatedError(error)) {
      redirect(`/sign-in?redirect_url=${encodeURIComponent(`/app/courses/${courseId}/${lessonSlug}`)}`)
    }
    if (isForbiddenError(error)) {
      forbidden()
    }
    throw error
  }

  if (!data) {
    notFound()
  }

  const blocks = parseCourseBody(data.lesson.body)
  const videoResource = data.resources.find((resource: (typeof data.resources)[number]) => resource.type === "video")
  const lessonUrl = videoResource?.url ?? null
  const flatLessons = data.chapters.flatMap((chapter) => chapter.lessons)

  return (
    <main className="min-h-screen bg-background">
      {/* Sidebar - includes mobile floating button and desktop sidebar */}
      <CourseLessonSidebar
        courseSlug={data.course.slug}
        courseTitle={data.course.title}
        coverImageUrl={data.course.coverImageUrl}
        currentLessonId={data.lesson._id}
        lessons={flatLessons}
      />
      
      <div className="flex w-full items-stretch">
        {/* Desktop sidebar spacer */}
        <div className="hidden w-[320px] shrink-0 lg:block" />

        <section className="flex flex-1 flex-col min-w-0">
          <CourseWorkspaceHeader />

          <section id="lesson-video-player" className="dark relative bg-black">
            {data.lesson.muxPlaybackId ? (
              <PrivateMuxPlayer
                courseId={data.course._id}
                lessonId={data.lesson._id}
                playbackId={data.lesson.muxPlaybackId}
                playbackPolicy={data.lesson.muxPlaybackPolicy ?? null}
                durationSeconds={data.lesson.durationSeconds ?? null}
                nextLessonHref={
                  data.navigation.nextLesson
                    ? `/app/courses/${data.course.slug}/${data.navigation.nextLesson.slug}`
                    : null
                }
                posterUrl={data.course.coverImageUrl}
              />
            ) : lessonUrl ? (
              <video
                controls
                preload="metadata"
                poster={data.course.coverImageUrl ?? undefined}
                className="mx-auto aspect-video h-full w-full object-contain lg:max-h-[75vh]"
                src={lessonUrl}
              />
            ) : data.lesson.muxStatus === "processing" || data.lesson.muxStatus === "uploading" ? (
              <div className="flex aspect-video h-full w-full items-center justify-center px-6 text-center text-sm">
                This lesson video is still processing in Mux.
              </div>
            ) : data.course.coverImageUrl ? (
              <img src={data.course.coverImageUrl} alt={data.lesson.title} className="mx-auto aspect-video h-full w-full object-contain lg:max-h-[75vh]" />
            ) : (
              <div className="aspect-video h-full w-full" />
            )}
          </section>

          {/* Action bar */}
          <div className="flex items-center justify-between bg-card px-6 py-3 mb-8">
            <div>
              {data.lesson.githubUrl ? (
                <Link
                  href={data.lesson.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                  <span>Source Code</span>
                </Link>
              ) : null}
            </div>

            <div className="flex items-center">
              <div className="px-4">
                <LessonProgressToggle courseId={data.course._id} lessonId={data.lesson._id} completed={Boolean(data.progress?.completed)} />
              </div>
              {data.navigation.nextLesson ? (
                <Link
                  href={`/app/courses/${data.course.slug}/${data.navigation.nextLesson.slug}`}
                  className="inline-flex items-center gap-2 bg-muted/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <span>Next</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 bg-muted/50 px-3 py-2 text-sm font-medium text-foreground/40">
                  <span>Next</span>
                  <span aria-hidden="true">→</span>
                </span>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="mx-auto w-full max-w-3xl px-6 pb-8 space-y-8">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">{data.lesson.title}</h1>
              </div>

              <div className="space-y-5">
                <LessonTranscript
                  lessonId={data.lesson._id}
                  transcriptStatus={data.lesson.transcriptStatus}
                  transcriptTrackId={data.lesson.transcriptTrackId}
                  fallbackBlocks={blocks}
                />
              </div>

              {data.navigation.nextLesson ? (
                <nav className="pt-8">
                  <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">UP NEXT</p>
                  <Link href={`/app/courses/${data.course.slug}/${data.navigation.nextLesson.slug}`} className="mt-3 flex items-center justify-between gap-4 rounded-xl border bg-background p-4 transition-colors hover:bg-muted">
                    <div>
                      <p className="text-base font-semibold">{data.navigation.nextLesson.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Continue through the course sequence.</p>
                    </div>
                    <span className="text-sm font-medium">Open</span>
                  </Link>
                </nav>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
