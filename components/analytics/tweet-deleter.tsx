"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TweetDeleterProps {
  onDelete: (tweetId: string) => Promise<boolean>
}

export function TweetDeleter({ onDelete }: TweetDeleterProps) {
  const [tweetUrl, setTweetUrl] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleDelete = async () => {
    // Reset states
    setError(null)
    setSuccess(null)

    // Validate URL
    if (!tweetUrl) {
      setError("Please enter a tweet URL")
      return
    }

    // Extract tweet ID from URL
    let tweetId: string | null = null

    try {
      // Handle different Twitter URL formats
      const url = new URL(tweetUrl)
      const pathParts = url.pathname.split("/")

      if (url.hostname.includes("twitter.com") || url.hostname.includes("x.com")) {
        // Find the status part in the URL
        const statusIndex = pathParts.findIndex((part) => part === "status" || part === "statuses")
        if (statusIndex !== -1 && pathParts.length > statusIndex + 1) {
          tweetId = pathParts[statusIndex + 1]
        }
      }

      if (!tweetId) {
        setError("Invalid tweet URL. Please enter a valid Twitter/X tweet URL.")
        return
      }

      setIsDeleting(true)
      const success = await onDelete(tweetId)

      if (success) {
        setSuccess("Tweet deleted successfully!")
        setTweetUrl("")
      } else {
        setError("Failed to delete tweet. Please try again.")
      }
    } catch (error) {
      console.error("Error parsing tweet URL:", error)
      setError("Invalid URL format. Please enter a valid Twitter/X tweet URL.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Tweet</CardTitle>
        <CardDescription>Delete a specific tweet by URL</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="tweet-url">Tweet URL</Label>
            <Input
              id="tweet-url"
              placeholder="https://twitter.com/username/status/1234567890"
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleDelete} disabled={isDeleting || !tweetUrl} className="w-full">
          {isDeleting ? "Deleting..." : "Delete Tweet"}
          <Trash2 className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

