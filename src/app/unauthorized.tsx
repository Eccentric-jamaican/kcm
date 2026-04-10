import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-[2rem] border bg-background p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">401 UNAUTHORIZED</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Sign in to open the KCM maintainer workspace.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          The admin dashboard is protected so only signed-in maintainers can manage live course content.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-in?redirect_url=/app/admin"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
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
