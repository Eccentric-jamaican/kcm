"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/convex-api"

export function SeedDemoCourses() {
  const router = useRouter()
  const viewer = useQuery(api.users.viewer, {})
  const seedCourses = useMutation(api.seed.seedCoursesAndLessons)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSeed() {
    if (!viewer?._id) {
      return
    }

    setPending(true)
    setMessage(null)
    try {
      const result = await seedCourses({ maintainerUserId: viewer._id })
      setMessage(result.message ?? `Seeded ${result.count} demo courses.`)
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to seed demo courses.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/60 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">Need starter content?</p>
        <p className="text-xs text-muted-foreground">Seed demo courses so admin flows have real data.</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
        <Button size="sm" variant="outline" onClick={handleSeed} disabled={pending || !viewer?._id} className="h-8 rounded-lg text-xs">
          {pending ? "Seeding…" : "Seed Demos"}
        </Button>
      </div>
    </div>
  )
}
