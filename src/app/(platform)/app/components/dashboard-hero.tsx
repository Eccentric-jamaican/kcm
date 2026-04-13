import Link from "next/link"

export function DashboardHero() {
  return (
    <section className="relative">
      <div className="relative w-screen overflow-hidden bg-gradient-to-br from-kcm-burgundy via-kcm-red to-kcm-burgundy py-12 text-white sm:py-16 md:py-20"
        style={{
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.12)_0%,transparent_35%,rgba(0,0,0,0.14)_100%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Build your trading strategy on modern trading skills and courses
              </h1>
              <p className="mt-5 text-xl leading-relaxed text-white/95">
                Join a cohort with Kenneth and get really good at trading
              </p>
              <Link
                href="/app/browse"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-base font-medium text-kcm-burgundy transition-colors hover:bg-white/90"
              >
                Browse courses
                <span aria-hidden>›</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Webinars Promo Card */}
      <div className="mx-auto mt-6 max-w-6xl rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Missed a live session?
            </h2>
            <p className="text-sm text-muted-foreground">
              Watch recordings of past webinars covering market analysis, strategy sessions, and Q&As.
            </p>
          </div>
          <Link
            href="/app/webinars"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-kcm-red px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-kcm-red/20 transition-all hover:bg-kcm-red/90 hover:shadow-kcm-red/30"
          >
            Watch Past Webinars
            <span aria-hidden>›</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
