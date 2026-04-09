"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function CourseShareButton({
  title,
  url,
}: {
  title: string
  url: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const shareUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`

    if (navigator.share) {
      await navigator.share({ title, url: shareUrl })
      return
    }

    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="lg" className="rounded-full" onClick={handleShare}>
      {copied ? "Copied" : "Share"}
    </Button>
  )
}
