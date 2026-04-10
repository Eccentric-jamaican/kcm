"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)

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
    <Button 
      variant="outline" 
      size="lg" 
      className="inline-flex h-12 items-center gap-2 rounded-xl px-6 text-base" 
      onClick={handleShare}
    >
      <ShareIcon />
      {copied ? "Copied" : "Share"}
    </Button>
  )
}
