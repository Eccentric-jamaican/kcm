"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/convex-api"

export default function NewCoursePage() {
  const router = useRouter()
  const createCourse = useMutation(api.admin.createCourse)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleCreate() {
    if (!title.trim()) return
    setCreating(true)
    setMessage(null)
    try {
      const courseId = await createCourse({
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        body: description.trim(),
      })
      router.push(`/app/admin/courses/${courseId}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create course.")
      setCreating(false)
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <section>
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">NEW COURSE</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Start a fresh course shell.</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Creating a course automatically provisions its default chapter so you can begin adding lessons immediately.
          </p>
        </section>

        <section className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
          <div className="grid gap-4">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Course title" />
            <Input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="Subtitle" />
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-32" placeholder="What will students learn?" />
            <Button onClick={handleCreate} disabled={creating} className="rounded-full">
              {creating ? "Creating..." : "Create Course"}
            </Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </div>
        </section>
      </div>
    </main>
  )
}
