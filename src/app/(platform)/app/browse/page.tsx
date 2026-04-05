"use client"

import Link from "next/link"
import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon, SettingsIcon } from "@hugeicons/core-free-icons"

import { courseCatalog } from "../components/course-data"
import { cn } from "@/lib/utils"

type BrowseTab = "newest" | "courses" | "cohorts"

const browseTabs: { id: BrowseTab; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "courses", label: "Courses" },
  { id: "cohorts", label: "Cohorts" },
]

export default function BrowsePage() {
  const [query, setQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<BrowseTab>("newest")

  const results = React.useMemo(() => {
    const lowered = query.trim().toLowerCase()
    const baseList = [...courseCatalog].sort((a, b) => Number(b.id) - Number(a.id))
    if (!lowered) return baseList

    return baseList.filter((course) => {
      const haystack = [course.title, course.subtitle, course.description, course.tags.join(" ")]
        .join(" ")
        .toLowerCase()
      return haystack.includes(lowered)
    })
  }, [query])

  const filteredResults = React.useMemo(() => {
    if (activeTab === "cohorts") return []
    return results
  }, [activeTab, results])

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r pr-10 lg:block">
          <h2 className="text-[2rem] font-semibold tracking-tight">Browse by</h2>
          <div className="mt-6 space-y-3">
            {browseTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "block w-full rounded-lg px-1 py-1 text-left text-[1.65rem] tracking-tight transition-colors",
                  activeTab === tab.id ? "text-primary" : "text-foreground/90 hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              aria-label="Open browse filters"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-card text-muted-foreground"
            >
              <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} className="h-5 w-5" />
            </button>
            <label className="flex h-11 flex-1 items-center gap-2 rounded-full border bg-muted/50 px-4 text-muted-foreground">
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          <label className="hidden h-12 items-center gap-2 rounded-full border bg-muted/50 px-4 text-muted-foreground lg:flex">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="h-4 w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>

          {activeTab === "cohorts" ? (
            <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
              Cohort enrollment opens soon.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {filteredResults.map((course) => (
                <Link
                  key={course.id}
                  href={`/app/courses/${course.id}`}
                  className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img src={course.imageUrl} alt={course.title} className="aspect-video w-full object-cover" />
                  <div className="space-y-2 p-3 md:p-4">
                    <h3 className="line-clamp-2 text-xl font-semibold leading-tight md:text-2xl">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <div className="flex flex-wrap gap-1.5">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/90"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
