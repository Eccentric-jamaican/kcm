"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/convex-api"
import { getConvexErrorMessage } from "@/lib/convex-errors"

type Lesson = {
  _id: string
  title: string
  resources: Array<{
    _id: string
    title: string
    type: "video" | "file" | "link"
    url: string | null
  }>
}

export function ResourceManager({
  lesson,
}: {
  lesson: Lesson
}) {
  const router = useRouter()
  const createResource = useMutation(api.admin.createLessonResource)
  const deleteResource = useMutation(api.admin.deleteLessonResource)
  const generateUpload = useMutation(api.admin.generateResourceUploadUrl)
  const [kind, setKind] = useState<"link" | "file">("link")
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  async function handleCreateLink() {
    try {
      await createResource({
        lessonId: lesson._id as never,
        type: "link",
        title: title || "Reference link",
        storageId: null,
        url: url || null,
        mimeType: null,
        fileSize: null,
        metadata: {},
      })
      setTitle("")
      setUrl("")
      setMessage("Link added.")
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(getConvexErrorMessage(error, "Unable to add this resource."))
    }
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return
    try {
      const { uploadUrl } = await generateUpload({ lessonId: lesson._id as never })
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      const payload = (await response.json()) as { storageId: string }
      await createResource({
        lessonId: lesson._id as never,
        type: "file",
        title: title || file.name,
        storageId: payload.storageId as never,
        url: null,
        mimeType: file.type || null,
        fileSize: file.size,
        metadata: {},
      })
      setTitle("")
      setMessage(`${file.name} uploaded.`)
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(getConvexErrorMessage(error, "Unable to upload this resource."))
    }
  }

  async function handleDelete(resourceId: string) {
    try {
      await deleteResource({ resourceId: resourceId as never })
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(getConvexErrorMessage(error, "Unable to remove this resource."))
    }
  }

  const typeIcon: Record<string, string> = { link: "🔗", file: "📄", video: "🎬" }

  return (
    <div className="space-y-5">
      {/* Add resource — compact inline form */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold">{lesson.title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Attach files and links to this lesson.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="file">File</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cheat sheet…" />
          </div>
          {kind === "link" ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">URL</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateLink} size="sm" className="h-9 rounded-lg text-xs">Add</Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">File</Label>
                <Input type="file" className="text-xs" onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)} />
              </div>
              <div />
            </>
          )}
        </div>
        {message ? <p className="mt-2 text-xs text-muted-foreground">{message}</p> : null}
      </div>

      {/* Resource list — compact rows */}
      {lesson.resources.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">No resources attached yet.</p>
      ) : (
        <div className="divide-y rounded-xl border bg-card">
          {lesson.resources.map((resource) => (
            <div key={resource._id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm">{typeIcon[resource.type] ?? "📎"}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{resource.title}</p>
                  {resource.url ? <p className="truncate text-xs text-muted-foreground">{resource.url}</p> : null}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 shrink-0 rounded px-2 text-xs text-muted-foreground hover:text-destructive" onClick={() => handleDelete(resource._id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
