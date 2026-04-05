import Link from "next/link"
import { courseCatalog, continueLearningCourses, getCourseById } from "../components/course-data"

export default function CoursesPage() {
  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <section>
          <h1 className="text-4xl font-semibold tracking-tight">My Courses</h1>
          <p className="mt-2 text-muted-foreground">Continue from where you stopped.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight">Continue watching</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {continueLearningCourses.map((item) => {
              const course = getCourseById(item.courseId)
              if (!course) return null

              return (
                <Link
                  key={item.courseId}
                  href={`/app/courses/${item.courseId}`}
                  className="overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img src={course.imageUrl} alt={course.title} className="aspect-video w-full object-cover" />
                  <div className="space-y-2 p-4">
                    <h3 className="line-clamp-2 text-2xl font-semibold leading-tight">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.currentChapter}</p>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.progress}% complete</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight">Library</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courseCatalog.map((course) => (
              <Link
                key={course.id}
                href={`/app/courses/${course.id}`}
                className="overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <img src={course.imageUrl} alt={course.title} className="aspect-video w-full object-cover" />
                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-2 text-2xl font-semibold leading-tight">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">Course</p>
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
          </div>
        </section>
      </div>
    </main>
  )
}
