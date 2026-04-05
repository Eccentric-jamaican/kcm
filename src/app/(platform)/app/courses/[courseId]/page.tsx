import Link from "next/link"
import { notFound } from "next/navigation"
import { courseCatalog, getCourseById } from "../../components/course-data"

type CoursePageProps = {
  params: Promise<{ courseId: string }>
}

export function generateStaticParams() {
  return courseCatalog.map((course) => ({ courseId: course.id }))
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { courseId } = await params
  const course = getCourseById(courseId)

  if (!course) {
    notFound()
  }

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto mb-5 max-w-[1400px] overflow-hidden rounded-xl border bg-card lg:hidden">
        <img src={course.imageUrl} alt={course.title} className="aspect-video w-full object-cover" />
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">COURSE</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight">{course.title}</h1>
          <h2 className="max-w-3xl text-xl text-muted-foreground">{course.subtitle}</h2>

          <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
            <img
              src="https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_96/f_auto/q_100/v1760621497/antonio-thumbs-up_2x_r4upxk?_a=BAVAZGAQ0"
              alt="Instructor"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">CREATED BY</p>
              <p className="text-sm font-semibold">Antonio</p>
              <p className="text-sm text-muted-foreground">
                Adapted for KCM learners with route structure specific to this project.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="#modules"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start Watching
            </Link>
            <Link
              href="/app/browse"
              className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Code
            </Link>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Share
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">OVERVIEW</p>
            <div className="overflow-hidden rounded-xl border bg-black/90">
              <img src={course.imageUrl} alt={course.title} className="aspect-video w-full object-cover opacity-90" />
            </div>
            <p className="text-base text-muted-foreground">{course.description}</p>
            <p className="text-base text-muted-foreground">
              This route maps Antonio-style workshop presentation to `/app/courses/[courseId]` for KCM.
            </p>
          </div>
        </section>

        <aside id="modules" className="h-fit rounded-xl border bg-card p-3 lg:sticky lg:top-6">
          <img src={course.imageUrl} alt={course.title} className="aspect-video w-full rounded-lg object-cover" />
          <div className="mt-3 space-y-1">
            {course.chapterList.map((chapter, index) => (
              <a
                key={chapter.id}
                href={`#chapter-${chapter.id}`}
                className="block rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
              >
                {index + 1}. {chapter.title}
              </a>
            ))}
          </div>
        </aside>
      </div>

      <div className="mx-auto mt-6 grid max-w-[1400px] gap-3">
        {course.chapterList.map((chapter, index) => (
          <section key={chapter.id} id={`chapter-${chapter.id}`} className="rounded-xl border bg-card p-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">CHAPTER {index + 1}</p>
            <h3 className="mt-1 text-xl font-semibold">{chapter.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Duration: {chapter.duration}</p>
          </section>
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-[1400px] rounded-xl border bg-card p-4 lg:hidden">
        <h3 className="text-xl font-semibold">{course.title}</h3>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_96/f_auto/q_100/v1760621497/antonio-thumbs-up_2x_r4upxk?_a=BAVAZGAQ0"
              alt="Antonio"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-sm text-muted-foreground">Antonio</span>
          </div>
          <Link
            href="#modules"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Watching
          </Link>
        </div>
      </div>
    </main>
  )
}
