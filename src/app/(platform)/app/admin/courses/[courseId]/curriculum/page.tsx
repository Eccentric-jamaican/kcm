import { notFound } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/lib/convex-api"
import { requireConvexServerToken } from "@/lib/convex-server"
import { CurriculumBuilder } from "../../../components/curriculum-builder"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

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
    <main className="px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Curriculum</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{data.course.title}</h1>
          </div>
          <Link href={`/app/admin/courses/${courseId}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-lg text-xs")}>Back to Editor</Link>
        </section>

        <CurriculumBuilder courseId={courseId} chapters={data.chapters as never} />
      </div>
    </main>
  )
}
