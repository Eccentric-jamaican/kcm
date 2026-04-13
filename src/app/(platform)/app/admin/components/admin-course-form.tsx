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
import { getConvexErrorMessage } from "@/lib/convex-errors"

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
      headers: { "Content-Type": file.type },
      body: file,
    })
    const payload = (await response.json()) as { storageId: string }
    setForm((current) => ({
      ...current,
      coverImageStorageId: payload.storageId,
      coverImageUrl: current.coverImageUrl,
      coverImageAlt: current.coverImageAlt || current.title,
    }))
    setMessage(`Uploaded ${file.name}. Save to attach.`)
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
        tags: form.tags.split(",").map((v) => v.trim()).filter(Boolean),
        level: form.level,
        estimatedDurationMinutes: form.estimatedDurationMinutes ? Number(form.estimatedDurationMinutes) : null,
      })
      setMessage("Saved.")
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(getConvexErrorMessage(error, "Unable to save this course."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main form — flat sections with border-b dividers */}
      <div className="space-y-0 divide-y rounded-xl border bg-card">
        {/* Identity */}
        <div className="p-5">
          <h2 className="text-sm font-semibold">Course Identity</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="course-title" className="text-xs">Title</Label>
              <Input id="course-title" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="course-subtitle" className="text-xs">Subtitle</Label>
              <Input id="course-subtitle" value={form.subtitle} onChange={(e) => setForm((c) => ({ ...c, subtitle: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-slug" className="text-xs">Slug</Label>
              <Input id="course-slug" value={form.slug} onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="github-url" className="text-xs">GitHub URL</Label>
              <Input id="github-url" value={form.githubUrl} onChange={(e) => setForm((c) => ({ ...c, githubUrl: e.target.value }))} placeholder="https://github.com/…" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h2 className="text-sm font-semibold">Content</h2>
          <div className="mt-4 grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="course-description" className="text-xs">Description</Label>
              <Textarea id="course-description" value={form.description} className="min-h-20" onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-body" className="text-xs">Overview / Body</Label>
              <Textarea id="course-body" value={form.body} className="min-h-32" onChange={(e) => setForm((c) => ({ ...c, body: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Positioning */}
        <div className="p-5">
          <h2 className="text-sm font-semibold">Positioning</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Level</Label>
              <Select value={form.level} onValueChange={(v) => setForm((c) => ({ ...c, level: v as typeof c.level }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="All Levels">All Levels</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estimated-duration" className="text-xs">Duration (min)</Label>
              <Input id="estimated-duration" type="number" min="0" value={form.estimatedDurationMinutes} onChange={(e) => setForm((c) => ({ ...c, estimatedDurationMinutes: e.target.value }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="course-tags" className="text-xs">Tags</Label>
              <Input id="course-tags" value={form.tags} onChange={(e) => setForm((c) => ({ ...c, tags: e.target.value }))} placeholder="forex, psychology, risk" />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar — publishing, cover, save */}
      <div className="space-y-0 divide-y rounded-xl border bg-card lg:self-start lg:sticky lg:top-4">
        {/* Publishing */}
        <div className="p-5">
          <h2 className="text-sm font-semibold">Publishing</h2>
          <div className="mt-4 grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((c) => ({ ...c, status: v as typeof c.status }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Visibility</Label>
              <Select value={form.visibility} onValueChange={(v) => setForm((c) => ({ ...c, visibility: v as typeof c.visibility }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Cover image */}
        <div className="p-5">
          <h2 className="text-sm font-semibold">Cover Image</h2>
          <div className="mt-4 space-y-3">
            <div className="overflow-hidden rounded-lg border bg-muted">
              {form.coverImageUrl ? (
                <img src={form.coverImageUrl} alt={form.coverImageAlt || form.title} className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video w-full bg-[radial-gradient(circle_at_top_left,rgba(204,0,0,0.15),transparent_50%),linear-gradient(180deg,#faf8f8,white)]" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cover-alt" className="text-xs">Alt text</Label>
              <Input id="cover-alt" value={form.coverImageAlt || ""} onChange={(e) => setForm((c) => ({ ...c, coverImageAlt: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cover-upload" className="text-xs">Upload</Label>
              <Input id="cover-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="p-5">
          <Button onClick={handleSave} disabled={saving} size="sm" className="h-8 w-full rounded-lg text-xs">
            {saving ? "Saving…" : "Save Course"}
          </Button>
          {message ? <p className="mt-2 text-xs text-muted-foreground">{message}</p> : null}
        </div>
      </div>
    </div>
  )
}
