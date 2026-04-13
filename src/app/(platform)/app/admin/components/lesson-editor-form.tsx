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
import { getConvexErrorMessage } from "@/lib/convex-errors"

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
  muxPlaybackPolicy?: "public" | "signed"
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
        tags: form.tags.split(",").map((v) => v.trim()).filter(Boolean),
        chapterId: form.chapterId as never,
      })
      setMessage("Saved.")
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(getConvexErrorMessage(error, "Unable to save this lesson."))
    } finally {
      setSaving(false)
    }
  }

  async function handleMuxUpload(file: File | null) {
    if (!file) return
    setMessage("Creating Mux upload…")
    try {
      const { uploadUrl } = await createMuxDirectUpload({
        lessonId: lesson._id as never,
        corsOrigin: window.location.origin,
      })
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "video/mp4" },
        body: file,
      })
      setMessage("Uploaded. Mux is processing.")
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(getConvexErrorMessage(error, "Upload failed."))
    }
  }

  async function handleRefreshMux() {
    try {
      await refreshMuxAsset({ lessonId: lesson._id as never })
      setMessage("Mux refreshed.")
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(getConvexErrorMessage(error, "Refresh failed."))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Main form */}
      <div className="space-y-0 divide-y rounded-xl border bg-card">
        {/* Details */}
        <div className="p-5">
          <h2 className="text-sm font-semibold">Lesson Details</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={form.description} className="min-h-20" onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <h2 className="text-sm font-semibold">Transcript / Body</h2>
          <div className="mt-4">
            <Textarea value={form.body} className="min-h-48" onChange={(e) => setForm((c) => ({ ...c, body: e.target.value }))} />
          </div>
        </div>

        {/* Extras */}
        <div className="p-5">
          <h2 className="text-sm font-semibold">Extras</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Source Code URL</Label>
              <Input value={form.githubUrl} onChange={(e) => setForm((c) => ({ ...c, githubUrl: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Thumbnail Time (s)</Label>
              <Input type="number" min="0" value={form.thumbnailTime} onChange={(e) => setForm((c) => ({ ...c, thumbnailTime: e.target.value }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Prompt / Notes</Label>
              <Textarea value={form.prompt} className="min-h-16" onChange={(e) => setForm((c) => ({ ...c, prompt: e.target.value }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Tags</Label>
              <Input value={form.tags} onChange={(e) => setForm((c) => ({ ...c, tags: e.target.value }))} placeholder="video, recap, setup" />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar — publishing, video, save */}
      <div className="space-y-0 divide-y rounded-xl border bg-card lg:self-start lg:sticky lg:top-4">
        {/* Publishing */}
        <div className="p-5">
          <h2 className="text-sm font-semibold">Publishing</h2>
          <div className="mt-4 grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Chapter</Label>
              <Select value={form.chapterId} onValueChange={(v) => setForm((c) => ({ ...c, chapterId: v ?? c.chapterId }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {chapters.map((ch) => (
                    <SelectItem key={ch._id} value={ch._id}>{ch.isDefault ? "Default Chapter" : ch.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.state} onValueChange={(v) => setForm((c) => ({ ...c, state: v as typeof c.state }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
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

        {/* Video */}
        <div className="p-5">
          <h2 className="text-sm font-semibold">Video Delivery</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Status: {lesson.muxStatus}
            {lesson.muxPlaybackPolicy ? ` • ${lesson.muxPlaybackPolicy} playback` : ""}
          </p>
          {lesson.muxPlaybackId ? <p className="text-[10px] text-muted-foreground">ID: {lesson.muxPlaybackId}</p> : null}
          <p className="mt-2 text-xs text-muted-foreground">
            Uploads are private by default. Learners need course enrollment before KCM mints a Mux playback token.
          </p>
          <div className="mt-3 grid gap-2">
            <Input type="file" accept="video/*" className="text-xs" onChange={(e) => handleMuxUpload(e.target.files?.[0] ?? null)} />
            <Button variant="outline" size="sm" className="h-7 rounded-lg text-xs" onClick={handleRefreshMux}>Refresh Mux</Button>
          </div>
        </div>

        {/* Save */}
        <div className="p-5">
          <Button onClick={handleSave} disabled={saving} size="sm" className="h-8 w-full rounded-lg text-xs">
            {saving ? "Saving…" : "Save Lesson"}
          </Button>
          {message ? <p className="mt-2 text-xs text-muted-foreground">{message}</p> : null}
          <a
            href={`/app/courses/${courseId}/${lesson.slug}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex h-7 w-full items-center justify-center rounded-lg border text-xs font-medium transition-colors hover:bg-muted"
          >
            Open Learner View
          </a>
        </div>
      </div>
    </div>
  )
}
