"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/lib/convex-api"
import { Switch } from "@/components/ui/switch"

export function LessonProgressToggle({
  courseId,
  lessonId,
  completed,
}: {
  courseId: string
  lessonId: string
  completed: boolean
}) {
  const router = useRouter()
  const markComplete = useMutation(api.progress.markLessonComplete)
  const [pending, setPending] = useState(false)

  async function handleToggle() {
    setPending(true)
    await markComplete({
      courseId: courseId as never,
      lessonId: lessonId as never,
      completed: !completed,
    })
    startTransition(() => router.refresh())
    setPending(false)
  }

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 text-sm font-medium"
      disabled={pending}
      onClick={handleToggle}
    >
      <Switch checked={completed} />
      <span>{pending ? "Saving..." : "Complete"}</span>
    </button>
  )
}
