import { notFound } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { buttonVariants } from "@/components/ui/button-variants"
import { api } from "@/lib/convex-api"
import { requireConvexServerToken } from "@/lib/convex-server"
import { AdminCourseForm } from "../../components/admin-course-form"
import { cn } from "@/lib/utils"

export default async function AdminCourseEditorPage({
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
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">COURSE EDITOR</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{data.course.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Edit metadata, visibility, and the public-facing shell for this course.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`/app/courses/${data.course.slug}`} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>
              Learner View
            </a>
            <a href={`/app/admin/courses/${courseId}/curriculum`} className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>Open Curriculum</a>
          </div>
        </section>

        <AdminCourseForm course={data.course as never} />
      </div>
    </main>
  )
}
