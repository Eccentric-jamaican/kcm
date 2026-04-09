"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
    <main className="px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Page header */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">New Course</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Create a course</h1>
          <p className="mt-1 text-sm text-muted-foreground">A default chapter is created automatically so you can begin adding lessons immediately.</p>
        </section>

        {/* Form — flat, no card wrapper */}
        <section className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-title" className="text-xs">Title</Label>
            <Input id="new-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course title" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-subtitle" className="text-xs">Subtitle</Label>
            <Input id="new-subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Brief tagline" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-description" className="text-xs">Description</Label>
            <Textarea id="new-description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-28" placeholder="What will students learn?" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button onClick={handleCreate} disabled={creating} size="sm" className="h-8 rounded-lg text-xs">
              {creating ? "Creating…" : "Create Course"}
            </Button>
            {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
          </div>
        </section>
      </div>
    </main>
  )
}
