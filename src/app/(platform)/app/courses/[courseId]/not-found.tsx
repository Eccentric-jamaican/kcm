import Link from "next/link"

export default function CourseNotFound() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-xl border bg-card p-8 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Course Missing</p>
        <h1 className="mt-2 text-2xl font-semibold">This course could not be found.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The course may have moved, or the link may be outdated.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/app/courses"
            className="inline-flex h-7 items-center justify-center rounded-md bg-primary px-2 text-xs/relaxed font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Go to courses
          </Link>
          <Link
            href="/app/browse"
            className="inline-flex h-7 items-center justify-center rounded-md border border-input px-2 text-xs/relaxed font-medium transition-colors hover:bg-input/50"
          >
            Browse catalog
          </Link>
        </div>
      </div>
    </main>
  )
}
