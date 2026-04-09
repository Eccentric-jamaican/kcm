"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/convex-api"

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
    <Button variant={completed ? "outline" : "default"} className="rounded-full" disabled={pending} onClick={handleToggle}>
      {pending ? "Saving..." : completed ? "Completed" : "Mark Complete"}
    </Button>
  )
}
