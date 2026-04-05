import Link from "next/link"

import { courseCatalog } from "./course-data"

function FeaturedCourseCard({
  id,
  title,
  chapters,
  tags,
  imageUrl,
}: {
  id: string
  title: string
  chapters: number
  tags: string[]
  imageUrl: string
}) {
  return (
    <Link
      href={`/app/courses/${id}`}
      className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <img src={imageUrl} alt={title} className="aspect-video w-full object-cover" />
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-[1.45rem] font-semibold leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{chapters} chapters</p>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

export function CourseGrid() {
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
          {courseCatalog.map((course) => (
            <div key={course.id} className="basis-[72%] shrink-0 snap-center md:basis-auto md:shrink">
              <FeaturedCourseCard
                id={course.id}
                title={course.title}
                chapters={course.chapters}
                tags={course.tags}
                imageUrl={course.imageUrl}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
