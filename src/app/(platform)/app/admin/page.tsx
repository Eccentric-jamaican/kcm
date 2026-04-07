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
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section className="rounded-[2rem] border bg-background p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">MAINTAINER ADMIN</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Publish, revise, and sequence the live KCM curriculum from one place.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                This workspace is now backed by Convex and structured around courses, optional chapters, first-class lessons, Mux video delivery, and learner progress.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/app/admin/courses/new" className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>Create Course</Link>
              <Link href="/app/admin/courses" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>Open Library</Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Courses", value: stats.totalCourses },
            { label: "Published", value: stats.publishedCourses },
            { label: "Lessons", value: stats.totalLessons },
            { label: "Mux Errors", value: stats.erroredLessons },
          ].map((item) => (
            <Card key={item.label} className="rounded-[1.75rem] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold tracking-tight">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {stats.totalCourses === 0 ? <SeedDemoCourses /> : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[1.75rem] shadow-sm">
            <CardHeader>
              <CardTitle>Recently Touched Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentlyUpdated.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses yet. Create one or seed demo content to start shaping the library.</p>
              ) : (
                stats.recentlyUpdated.map((course) => (
                  <div key={course._id} className="flex flex-col gap-3 rounded-[1.25rem] border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold">{course.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {course.lessonCount} lessons • {course.status} • /app/courses/{course.slug}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/app/admin/courses/${course._id}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>Edit</Link>
                      <Link href={`/app/admin/courses/${course._id}/curriculum`} className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>Curriculum</Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] shadow-sm">
            <CardHeader>
              <CardTitle>Operational Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-[1.25rem] border p-4">
                <p className="font-medium text-foreground">Drafts waiting on publish</p>
                <p className="mt-1">{stats.draftCourses} courses are still in draft.</p>
              </div>
              <div className="rounded-[1.25rem] border p-4">
                <p className="font-medium text-foreground">Mux processing queue</p>
                <p className="mt-1">{stats.processingLessons} lessons are still uploading or processing.</p>
              </div>
              <div className="rounded-[1.25rem] border p-4">
                <p className="font-medium text-foreground">Archived inventory</p>
                <p className="mt-1">{stats.archivedCourses} courses are archived and hidden from the public library.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
