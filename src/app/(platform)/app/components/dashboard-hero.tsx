import Link from "next/link"

export function DashboardHero() {
  return (
    <section className="relative">
      <div className="relative w-screen overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 py-12 text-white sm:py-16 md:py-20 lg:py-24"
        style={{
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.12)_0%,transparent_35%,rgba(0,0,0,0.14)_100%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Build your career on modern full-stack skills
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/90 sm:text-xl">
              Join cohort-based courses with Antonio and get really good at modern development
            </p>
            <Link
              href="/app/browse"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
            >
              Browse courses
              <span aria-hidden>›</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Webinars Promo Card */}
      <div className="mx-auto mt-6 max-w-6xl rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Missed a live session?
            </h2>
            <p className="text-muted-foreground">
              Watch recordings of past webinars covering market analysis, strategy sessions, and Q&As.
            </p>
          </div>
          <Link
            href="/app/webinars"
            className="inline-flex items-center gap-2 rounded-xl bg-bull px-5 py-3 text-base font-medium text-bull-foreground shadow-sm shadow-bull/20 transition-all hover:bg-bull/90 hover:shadow-bull/30"
          >
            Watch Past Webinars
            <span aria-hidden>›</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
