import { notFound } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/lib/convex-api"
import { requireConvexServerToken } from "@/lib/convex-server"
import { LessonEditorForm } from "../../../../components/lesson-editor-form"

export default async function AdminLessonEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const token = await requireConvexServerToken()
  const [lessonData, courseData] = await Promise.all([
    fetchQuery(api.admin.getLessonEditor, { lessonId: lessonId as never }, { token }),
    fetchQuery(api.admin.getCourseEditor, { courseId: courseId as never }, { token }),
  ])

  if (!lessonData || !courseData) {
    notFound()
  }

  return (
    <main className="px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Lesson Editor</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{lessonData.lesson.title}</h1>
        </section>

        <LessonEditorForm
          courseId={courseId}
          lesson={lessonData.lesson as never}
          chapters={courseData.chapters.map((chapter) => ({
            _id: chapter._id,
            title: chapter.title,
            isDefault: chapter.isDefault,
          })) as never}
        />
      </div>
    </main>
  )
}
