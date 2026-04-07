import Link from "next/link"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/lib/convex-api"
import { getConvexServerToken } from "@/lib/convex-server"

export default async function BrowsePage() {
  const token = await getConvexServerToken()
  const courses = token ? await fetchQuery(api.courses.listPublished, {}, { token }) : []

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section>
          <h1 className="text-4xl font-semibold tracking-tight">Browse Courses</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every card on this page is now sourced from Convex and reflects the live course catalog maintained in `/app/admin`.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course._id}
              href={`/app/courses/${course.slug}`}
              className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {course.coverImageUrl ? (
                <img src={course.coverImageUrl} alt={course.title} className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video w-full bg-[radial-gradient(circle_at_top_left,rgba(27,156,72,0.2),transparent_45%),linear-gradient(180deg,#fafaf8,white)]" />
              )}
              <div className="space-y-2 p-4">
                <h2 className="line-clamp-2 text-2xl font-semibold tracking-tight">{course.title}</h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
