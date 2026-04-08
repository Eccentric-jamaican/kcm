import Link from "next/link"
import { fetchQuery } from "convex/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button-variants"
import { api } from "@/lib/convex-api"
import { requireConvexServerToken } from "@/lib/convex-server"
import { SeedDemoCourses } from "./components/seed-demo-courses"
import { cn } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const token = await requireConvexServerToken()
  const stats = await fetchQuery(api.admin.getDashboardStats, {}, { token })

  return (
    <main className="px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1400px] space-y-4 sm:space-y-6">
        <section className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground mb-1">ADMIN</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
                Course management
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/app/admin/courses" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}>Open Library</Link>
              <Link href="/app/admin/courses/new" className={cn(buttonVariants({ size: "sm" }), "rounded-md")}>Create Course</Link>
            </div>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-2 gap-4 border-y border-border/50 py-6 sm:gap-8 xl:grid-cols-4">
          {[
            { label: "Courses", value: stats.totalCourses },
            { label: "Published", value: stats.publishedCourses },
            { label: "Lessons", value: stats.totalLessons },
            { label: "Mux Errors", value: stats.erroredLessons },
          ].map((item) => (
            <div key={item.label} className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">{item.label}</p>
              <p className="text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
            </div>
          ))}
        </section>

        {stats.totalCourses === 0 ? <SeedDemoCourses /> : null}

        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground mb-4">Recently Touched Courses</h2>
            
            {stats.recentlyUpdated.length === 0 ? (
              <p className="text-sm text-muted-foreground">No courses yet. Create one or seed demo content to start shaping the library.</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                {stats.recentlyUpdated.map((course) => (
                  <div key={course._id} className="min-w-[280px] sm:min-w-[320px] snap-start flex flex-col justify-between rounded-md border border-border/50 bg-background/50 p-4 transition-colors hover:bg-background">
                    <div className="min-w-0 mb-4">
                      <p className="text-base font-medium">{course.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground truncate">
                        {course.lessonCount} lessons • {course.status} • {course.slug}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/app/admin/courses/${course._id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "flex-1 rounded-md bg-muted/50")}>Edit</Link>
                      <Link href={`/app/admin/courses/${course._id}/curriculum`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 rounded-md")}>Curriculum</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground mb-4">Operational Snapshot</h2>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground">
              <div className="flex justify-between items-start gap-4 border-b border-border/30 pb-3">
                <div>
                  <p className="font-medium text-foreground text-sm">Drafts</p>
                  <p className="text-xs mt-0.5">Courses waiting to be published.</p>
                </div>
                <span className="font-mono text-sm">{stats.draftCourses}</span>
              </div>
              <div className="flex justify-between items-start gap-4 border-b border-border/30 pb-3">
                <div>
                  <p className="font-medium text-foreground text-sm">Mux Processing</p>
                  <p className="text-xs mt-0.5">Lessons uploading or processing.</p>
                </div>
                <span className="font-mono text-sm">{stats.processingLessons}</span>
              </div>
              <div className="flex justify-between items-start gap-4 pb-3">
                <div>
                  <p className="font-medium text-foreground text-sm">Archived</p>
                  <p className="text-xs mt-0.5">Hidden from the public library.</p>
                </div>
                <span className="font-mono text-sm">{stats.archivedCourses}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
