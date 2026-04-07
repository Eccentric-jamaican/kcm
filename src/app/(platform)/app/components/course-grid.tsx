import Link from "next/link"

type CourseCard = {
  _id: string
  slug: string
  title: string
  lessonCount: number
  tags: string[]
  coverImageUrl: string | null
}

function FeaturedCourseCard({ course }: { course: CourseCard }) {
  return (
    <Link
      href={`/app/courses/${course.slug}`}
      className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {course.coverImageUrl ? (
        <img src={course.coverImageUrl} alt={course.title} className="aspect-video w-full object-cover" />
      ) : (
        <div className="aspect-video w-full bg-[radial-gradient(circle_at_top_left,rgba(27,156,72,0.2),transparent_45%),linear-gradient(180deg,#fafaf8,white)]" />
      )}
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-[1.45rem] font-semibold leading-tight">{course.title}</h3>
        <p className="text-sm text-muted-foreground">{course.lessonCount} lessons</p>
        <div className="flex flex-wrap gap-1.5">
          {course.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

export function CourseGrid({ courses }: { courses: CourseCard[] }) {
  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-3xl font-semibold tracking-tight">Featured Self-paced Courses</h2>
          <Link href="/app/browse" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="-mx-4 flex snap-x flex-row gap-5 overflow-x-auto px-4 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          {courses.map((course) => (
            <div key={course._id} className="basis-[72%] shrink-0 snap-center md:basis-auto md:shrink">
              <FeaturedCourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
