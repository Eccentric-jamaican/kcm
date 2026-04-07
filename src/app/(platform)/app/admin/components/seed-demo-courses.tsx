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
    <div className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold">Need starter content?</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Seed the Antonio-inspired demo library into Convex so the learner routes and admin flows have real course data to manage.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={handleSeed} disabled={pending || !viewer?._id} className="rounded-full">
          {pending ? "Seeding..." : "Seed Demo Courses"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  )
}
