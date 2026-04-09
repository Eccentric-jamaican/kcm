import Link from "next/link"
import { fetchQuery } from "convex/nextjs"
import { buttonVariants } from "@/components/ui/button-variants"
import { api } from "@/lib/convex-api"
import { requireConvexServerToken } from "@/lib/convex-server"
import { cn } from "@/lib/utils"

export default async function AdminCoursesPage() {
  const token = await requireConvexServerToken()
  const courses = await fetchQuery(api.admin.listCourses, {}, { token })

  return (
    <main className="px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        {/* Page header */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Courses</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Course Library</h1>
          </div>
          <Link href="/app/admin/courses/new" className={cn(buttonVariants({ size: "sm" }), "h-8 rounded-lg text-xs")}>Create Course</Link>
        </section>

        {/* Course table */}
        {courses.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No courses yet. Create the first course or seed demo content from the dashboard.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            {/* Table header */}
            <div className="hidden border-b bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_100px_100px_140px]">
              <span>Course</span>
              <span>Status</span>
              <span>Lessons</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table rows */}
            <div className="divide-y">
              {courses.map((course) => (
                <div key={course._id} className="group flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-muted/20 sm:grid sm:grid-cols-[1fr_100px_100px_140px] sm:items-center sm:gap-4">
                  {/* Course info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      {course.coverImageUrl ? (
                        <img src={course.coverImageUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{course.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{course.slug}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
                      course.status === "published" && "bg-bull/10 text-bull",
                      course.status === "draft" && "bg-yellow-500/10 text-yellow-600",
                      course.status === "archived" && "bg-muted text-muted-foreground",
                    )}>
                      {course.status}
                    </span>
                  </div>

                  {/* Lessons count */}
                  <p className="text-sm tabular-nums text-muted-foreground">{course.lessonCount}</p>

                  {/* Actions */}
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/app/admin/courses/${course._id}`} className="flex h-7 items-center rounded-lg border px-2.5 text-xs font-medium transition-colors hover:bg-muted">Edit</Link>
                    <Link href={`/app/admin/courses/${course._id}/curriculum`} className="flex h-7 items-center rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">Curriculum</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
