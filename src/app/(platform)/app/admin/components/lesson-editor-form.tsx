"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useAction, useMutation } from "convex/react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/convex-api"

type LessonRecord = {
  _id: string
  chapterId: string
  title: string
  slug: string
  description: string
  body: string
  state: "draft" | "published"
  visibility: "private" | "public" | "unlisted"
  githubUrl: string | null
  thumbnailTime: number | null
  isOptional: boolean
  prompt: string | null
  tags: string[]
  muxStatus: string
  muxPlaybackId: string | null
}

type ChapterOption = {
  _id: string
  title: string
  isDefault: boolean
}

export function LessonEditorForm({
  courseId,
  lesson,
  chapters,
}: {
  courseId: string
  lesson: LessonRecord
  chapters: ChapterOption[]
}) {
  const router = useRouter()
  const updateLesson = useMutation(api.admin.updateLesson)
  const createMuxDirectUpload = useAction(api.adminMux.createMuxDirectUpload)
  const refreshMuxAsset = useAction(api.adminMux.refreshMuxAsset)
  const [form, setForm] = useState({
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    body: lesson.body,
    state: lesson.state,
    visibility: lesson.visibility,
    githubUrl: lesson.githubUrl ?? "",
    thumbnailTime: lesson.thumbnailTime?.toString() ?? "",
    isOptional: lesson.isOptional,
    prompt: lesson.prompt ?? "",
    tags: lesson.tags.join(", "),
    chapterId: lesson.chapterId,
  })
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      await updateLesson({
        lessonId: lesson._id as never,
        title: form.title,
        slug: form.slug,
        description: form.description,
        body: form.body,
        state: form.state,
        visibility: form.visibility,
        githubUrl: form.githubUrl.trim() || null,
        thumbnailTime: form.thumbnailTime ? Number(form.thumbnailTime) : null,
        isOptional: form.isOptional,
        prompt: form.prompt.trim() || null,
        tags: form.tags.split(",").map((value) => value.trim()).filter(Boolean),
        chapterId: form.chapterId as never,
      })
      setMessage("Lesson saved.")
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save lesson.")
    } finally {
      setSaving(false)
    }
  }

  async function handleMuxUpload(file: File | null) {
    if (!file) return
    setMessage("Creating Mux upload...")
    try {
      const { uploadUrl } = await createMuxDirectUpload({
        lessonId: lesson._id as never,
        corsOrigin: window.location.origin,
      })
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "video/mp4",
        },
        body: file,
      })
      setMessage("Video uploaded. Mux is now processing it.")
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mux upload failed.")
    }
  }

  async function handleRefreshMux() {
    try {
      await refreshMuxAsset({ lessonId: lesson._id as never })
      setMessage("Mux status refreshed.")
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to refresh Mux status.")
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Lesson Details</h2>
          <div className="mt-5 grid gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} className="min-h-28" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Transcript / Body</Label>
              <Textarea value={form.body} className="min-h-72" onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} />
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Publishing</h2>
          <div className="mt-5 grid gap-4">
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select value={form.chapterId} onValueChange={(value) => setForm((current) => ({ ...current, chapterId: value ?? current.chapterId }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter._id} value={chapter._id}>
                      {chapter.isDefault ? "Default Chapter" : chapter.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.state} onValueChange={(value) => setForm((current) => ({ ...current, state: value as typeof current.state }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
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
            <div className="space-y-2">
              <Label>Source Code URL</Label>
              <Input value={form.githubUrl} onChange={(event) => setForm((current) => ({ ...current, githubUrl: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail Time (seconds)</Label>
              <Input type="number" min="0" value={form.thumbnailTime} onChange={(event) => setForm((current) => ({ ...current, thumbnailTime: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Prompt / Notes</Label>
              <Textarea value={form.prompt} className="min-h-24" onChange={(event) => setForm((current) => ({ ...current, prompt: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="video, recap, setup" />
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Video Delivery</h2>
          <p className="mt-2 text-sm text-muted-foreground">Current Mux status: {lesson.muxStatus}</p>
          {lesson.muxPlaybackId ? (
            <p className="mt-1 text-xs text-muted-foreground">Playback ID: {lesson.muxPlaybackId}</p>
          ) : null}
          <div className="mt-5 grid gap-3">
            <Input type="file" accept="video/*" onChange={(event) => handleMuxUpload(event.target.files?.[0] ?? null)} />
            <Button variant="outline" className="rounded-full" onClick={handleRefreshMux}>
              Refresh Mux Status
            </Button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
          <Button onClick={handleSave} disabled={saving} className="h-11 w-full rounded-full">
            {saving ? "Saving..." : "Save Lesson"}
          </Button>
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        </div>

        <a
          href={`/app/courses/${courseId}/${lesson.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 w-full items-center justify-center rounded-full border px-4 text-xs font-medium transition-colors hover:bg-muted"
        >
          Open Learner View
        </a>
      </aside>
    </div>
  )
}
