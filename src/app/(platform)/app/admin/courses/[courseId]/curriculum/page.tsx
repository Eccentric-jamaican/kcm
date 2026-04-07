import { notFound } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/lib/convex-api"
import { requireConvexServerToken } from "@/lib/convex-server"
import { CurriculumBuilder } from "../../../components/curriculum-builder"

export default async function AdminCurriculumPage({
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
        <section>
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">CURRICULUM BUILDER</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{data.course.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Reorder chapters, add lessons, and shape the exact path learners follow from the sidebar and next-lesson flow.
          </p>
        </section>

        <CurriculumBuilder courseId={courseId} chapters={data.chapters as never} />
      </div>
    </main>
  )
}
