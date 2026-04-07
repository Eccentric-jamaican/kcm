import Link from "next/link"

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-[#f2f2f4] px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-[2rem] border bg-background p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">403 FORBIDDEN</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          This admin area is reserved for course maintainers.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Your account can still use the learning platform, but it does not currently have maintainer or admin access.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to App
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  )
}
