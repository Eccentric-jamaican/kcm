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
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section>
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">LESSON EDITOR</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{lessonData.lesson.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            This is the first-class playback unit. Update transcript content, code links, publishing state, and Mux delivery here.
          </p>
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
