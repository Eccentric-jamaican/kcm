"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/convex-api"

type CourseFormValue = {
  _id: string
  slug: string
  title: string
  subtitle: string
  description: string
  body: string
  status: "draft" | "published" | "archived"
  visibility: "private" | "public" | "unlisted"
  coverImageStorageId: string | null
  coverImageUrl: string | null
  coverImageAlt: string | null
  githubUrl: string | null
  tags: string[]
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  estimatedDurationMinutes: number | null
}

export function AdminCourseForm({ course }: { course: CourseFormValue }) {
  const router = useRouter()
  const updateCourse = useMutation(api.admin.updateCourse)
  const createUploadUrl = useMutation(api.admin.generateCoverUploadUrl)
  const [form, setForm] = useState({
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    body: course.body,
    status: course.status,
    visibility: course.visibility,
    coverImageStorageId: course.coverImageStorageId,
    coverImageUrl: course.coverImageUrl,
    coverImageAlt: course.coverImageAlt ?? course.title,
    githubUrl: course.githubUrl ?? "",
    tags: course.tags.join(", "),
    level: course.level,
    estimatedDurationMinutes: course.estimatedDurationMinutes?.toString() ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleFileChange(file: File | null) {
    if (!file) return
    const { uploadUrl } = await createUploadUrl({ courseId: course._id as never })
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    })
    const payload = (await response.json()) as { storageId: string }
    setForm((current) => ({
      ...current,
      coverImageStorageId: payload.storageId,
      coverImageUrl: current.coverImageUrl,
      coverImageAlt: current.coverImageAlt || current.title,
    }))
    setMessage(`Uploaded ${file.name}. Save the course to attach it.`)
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      await updateCourse({
        courseId: course._id as never,
        slug: form.slug,
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        body: form.body,
        status: form.status,
        visibility: form.visibility,
        coverImageStorageId: form.coverImageStorageId as never,
        coverImageUrl: form.coverImageUrl,
        coverImageAlt: form.coverImageAlt,
        githubUrl: form.githubUrl.trim() || null,
        tags: form.tags
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        level: form.level,
        estimatedDurationMinutes: form.estimatedDurationMinutes ? Number(form.estimatedDurationMinutes) : null,
      })
      setMessage("Course saved.")
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save this course.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Course Identity</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="course-title">Title</Label>
              <Input id="course-title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="course-subtitle">Subtitle</Label>
              <Input id="course-subtitle" value={form.subtitle} onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="course-slug">Slug</Label>
              <Input id="course-slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="course-description">Description</Label>
              <Textarea id="course-description" value={form.description} className="min-h-28" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="course-body">Overview / Body</Label>
              <Textarea id="course-body" value={form.body} className="min-h-40" onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} />
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Positioning</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={form.level} onValueChange={(value) => setForm((current) => ({ ...current, level: value as typeof current.level }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="All Levels">All Levels</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated-duration">Estimated Duration (minutes)</Label>
              <Input id="estimated-duration" type="number" min="0" value={form.estimatedDurationMinutes} onChange={(event) => setForm((current) => ({ ...current, estimatedDurationMinutes: event.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="course-tags">Tags</Label>
              <Input id="course-tags" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="forex, psychology, risk management" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="github-url">Source Code / GitHub URL</Label>
              <Input id="github-url" value={form.githubUrl} onChange={(event) => setForm((current) => ({ ...current, githubUrl: event.target.value }))} placeholder="https://github.com/your-org/repo" />
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Publishing</h2>
          <div className="mt-5 grid gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value as typeof current.status }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={form.visibility} onValueChange={(value) => setForm((current) => ({ ...current, visibility: value as typeof current.visibility }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Cover Image</h2>
          <div className="mt-5 space-y-4">
            <div className="overflow-hidden rounded-[1.5rem] border bg-muted">
              {form.coverImageUrl ? (
                <img src={form.coverImageUrl} alt={form.coverImageAlt || form.title} className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video w-full bg-[radial-gradient(circle_at_top_left,rgba(27,156,72,0.18),transparent_50%),linear-gradient(180deg,#fafaf8,white)]" />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover-alt">Alt text</Label>
              <Input id="cover-alt" value={form.coverImageAlt || ""} onChange={(event) => setForm((current) => ({ ...current, coverImageAlt: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover-upload">Upload image</Label>
              <Input id="cover-upload" type="file" accept="image/*" onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)} />
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
          <Button onClick={handleSave} disabled={saving} className="h-11 w-full rounded-full">
            {saving ? "Saving..." : "Save Course"}
          </Button>
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </aside>
    </div>
  )
}
