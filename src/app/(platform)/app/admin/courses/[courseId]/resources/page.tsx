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

  const selectedLessonId = lessonId ?? courseData.chapters.flatMap((chapter) => chapter.lessons)[0]?._id
  if (!selectedLessonId) {
    notFound()
  }

  const lessonData = await fetchQuery(api.admin.getLessonEditor, { lessonId: selectedLessonId as never }, { token })
  if (!lessonData) {
    notFound()
  }

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section>
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">RESOURCE MANAGER</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{courseData.course.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Attach downloadable files, checklists, and reference links to each lesson without leaving the course admin.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-[1.75rem] border bg-card p-4 shadow-sm">
            <div className="space-y-2">
              {courseData.chapters.flatMap((chapter) => chapter.lessons).map((lesson) => (
                <a
                  key={lesson._id}
                  href={`/app/admin/courses/${courseId}/resources?lessonId=${lesson._id}`}
                  className={`block rounded-[1rem] px-3 py-3 text-sm transition-colors ${
                    lesson._id === selectedLessonId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
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
