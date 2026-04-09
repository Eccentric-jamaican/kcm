import { notFound } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { buttonVariants } from "@/components/ui/button-variants"
import { api } from "@/lib/convex-api"
import { requireConvexServerToken } from "@/lib/convex-server"
import { AdminCourseForm } from "../../components/admin-course-form"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
    <main className="px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        {/* Page header */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Course Editor</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{data.course.title}</h1>
          </div>
          <div className="flex gap-2">
            <a href={`/app/courses/${data.course.slug}`} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-lg text-xs")}>
              Learner View
            </a>
            <Link href={`/app/admin/courses/${courseId}/curriculum`} className={cn(buttonVariants({ size: "sm" }), "h-8 rounded-lg text-xs")}>Curriculum</Link>
          </div>
        </section>

        <AdminCourseForm course={data.course as never} />
      </div>
    </main>
  )
}
