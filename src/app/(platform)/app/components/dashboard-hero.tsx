import Link from "next/link"

export function DashboardHero() {
  return (
    <section className="px-4 py-0 sm:px-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-8 text-white sm:rounded-b-xl sm:p-10 md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.12)_0%,transparent_35%,rgba(0,0,0,0.14)_100%)]" />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Build your career on modern full-stack skills
            </h1>
            <p className="mt-5 text-xl leading-relaxed text-white/95">
              Join cohort-based courses with Antonio and get really good at modern development
            </p>
            <Link
              href="/app/browse"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-base font-medium text-slate-900 transition-colors hover:bg-white/90"
            >
              Browse courses
              <span aria-hidden>›</span>
            </Link>
          </div>

          <div className="hidden md:flex md:justify-end">
            <img
              src="https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_640/f_auto/q_auto/v1768294438/antonio-pointing_2x_vffopn?_a=BAVAZGAQ0"
              alt="Mentor illustration"
              className="h-[360px] w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
