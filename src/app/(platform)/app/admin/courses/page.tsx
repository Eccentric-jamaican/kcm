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
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">COURSE LIBRARY</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Manage the live KCM course catalog.</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Search, publish, archive, and jump into each course’s curriculum and lesson editor.
            </p>
          </div>
          <Link href="/app/admin/courses/new" className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>Create Course</Link>
        </section>

        <section className="grid gap-4">
          {courses.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed bg-card p-8 text-sm text-muted-foreground shadow-sm">
              No courses yet. Create the first course or seed demo content from the dashboard.
            </div>
          ) : (
            courses.map((course) => (
              <article key={course._id} className="rounded-[1.75rem] border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="h-24 w-40 shrink-0 overflow-hidden rounded-[1.25rem] border bg-muted">
                      {course.coverImageUrl ? (
                        <img src={course.coverImageUrl} alt={course.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-semibold tracking-tight">{course.title}</h2>
                        <span className="rounded-full border px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
                          {course.status}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{course.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {course.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {course.lessonCount} lessons • {course.chapterCount} chapters • slug: {course.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/app/admin/courses/${course._id}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>Edit</Link>
                    <Link href={`/app/admin/courses/${course._id}/preview`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>Preview</Link>
                    <Link href={`/app/admin/courses/${course._id}/curriculum`} className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>Curriculum</Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  )
}
