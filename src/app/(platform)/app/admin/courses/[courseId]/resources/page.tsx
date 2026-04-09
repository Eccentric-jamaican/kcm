import { notFound } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/lib/convex-api"
import { requireConvexServerToken } from "@/lib/convex-server"
import { ResourceManager } from "../../../components/resource-manager"

export default async function AdminResourcesPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>
  searchParams: Promise<{ lessonId?: string }>
}) {
  const { courseId } = await params
  const { lessonId } = await searchParams
  const token = await requireConvexServerToken()
  const courseData = await fetchQuery(api.admin.getCourseEditor, { courseId: courseId as never }, { token })

  if (!courseData) {
    notFound()
  }

  const allLessons = courseData.chapters.flatMap((chapter) => chapter.lessons)
  const selectedLessonId = lessonId ?? allLessons[0]?._id
  if (!selectedLessonId) {
    notFound()
  }

  const lessonData = await fetchQuery(api.admin.getLessonEditor, { lessonId: selectedLessonId as never }, { token })
  if (!lessonData) {
    notFound()
  }

  return (
    <main className="px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Resources</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{courseData.course.title}</h1>
        </section>

        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          {/* Lesson selector — clean list */}
          <aside className="lg:self-start lg:sticky lg:top-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Lessons</p>
            <div className="space-y-0.5">
              {allLessons.map((lesson) => (
                <a
                  key={lesson._id}
                  href={`/app/admin/courses/${courseId}/resources?lessonId=${lesson._id}`}
                  className={`block truncate rounded-lg px-3 py-2 text-sm transition-colors ${
                    lesson._id === selectedLessonId
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {lesson.title}
                </a>
              ))}
            </div>
          </aside>

          <ResourceManager
            lesson={{
              _id: lessonData.lesson._id,
              title: lessonData.lesson.title,
              resources: lessonData.resources,
            }}
          />
        </div>
      </div>
    </main>
  )
}
