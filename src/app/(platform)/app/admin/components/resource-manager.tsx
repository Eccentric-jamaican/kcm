"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/convex-api"

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
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return
    const { uploadUrl } = await generateUpload({ lessonId: lesson._id as never })
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
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
  }

  async function handleDelete(resourceId: string) {
    await deleteResource({ resourceId: resourceId as never })
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">{lesson.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Manage the downloadable and external resources attached to this lesson.</p>
        <div className="mt-5 grid gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={kind} onValueChange={(value) => setKind(value as typeof kind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="file">File Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Cheat sheet, checklist, replay notes..." />
          </div>
          {kind === "link" ? (
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." />
              <Button onClick={handleCreateLink} className="rounded-full">Add Link</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Upload file</Label>
              <Input type="file" onChange={(event) => handleFileUpload(event.target.files?.[0] ?? null)} />
            </div>
          )}
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </div>

      <div className="grid gap-3">
        {lesson.resources.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed bg-card p-6 text-sm text-muted-foreground shadow-sm">
            No resources attached to this lesson yet.
          </div>
        ) : (
          lesson.resources.map((resource) => (
            <div key={resource._id} className="flex flex-col gap-3 rounded-[1.5rem] border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{resource.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{resource.type}</p>
                {resource.url ? <p className="mt-2 break-all text-sm text-muted-foreground">{resource.url}</p> : null}
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => handleDelete(resource._id)}>
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
