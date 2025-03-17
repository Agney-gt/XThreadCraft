"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Repeat, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Tweet {
  id: string
  content: string
  date: string
  likes: number
  retweets: number
  replies: number
  impressions: number
}

export function TweetsList() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [selectedTweets, setSelectedTweets] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/twitter/user-data?timeframe=7d")

        if (!response.ok) {
          throw new Error("Failed to fetch tweets")
        }

        const data = await response.json()
        setTweets(data.tweets || [])
      } catch (err) {
        console.error("Error fetching tweets:", err)
        setError("Failed to load tweets")
      } finally {
        setLoading(false)
      }
    }

    fetchTweets()
  }, [])

  const toggleTweetSelection = (id: string) => {
    if (selectedTweets.includes(id)) {
      setSelectedTweets(selectedTweets.filter((tweetId) => tweetId !== id))
    } else {
      setSelectedTweets([...selectedTweets, id])
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins}m`
    } else if (diffHours < 24) {
      return `${diffHours}h`
    } else {
      return `${diffDays}d`
    }
  }

  const handleDeleteSelected = async () => {
    if (!selectedTweets.length) return

    if (confirm(`Are you sure you want to delete ${selectedTweets.length} tweets? This action cannot be undone.`)) {
      try {
        setLoading(true)

        // In a real implementation, this would call the API to delete tweets
        const response = await fetch("/api/twitter/delete-tweets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tweetIds: selectedTweets,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to delete tweets")
        }

        // Remove deleted tweets from the list
        setTweets(tweets.filter((tweet) => !selectedTweets.includes(tweet.id)))
        setSelectedTweets([])
      } catch (err) {
        console.error("Error deleting tweets:", err)
        setError("Failed to delete tweets")
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer">
              All
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Tweets
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Replies
            </Badge>
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-4 mt-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-24 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">{error}</div>
  }

  return (
    <div>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex gap-2">
          <Badge
            variant={filter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            All
          </Badge>
          <Badge
            variant={filter === "tweets" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("tweets")}
          >
            Tweets
          </Badge>
          <Badge
            variant={filter === "replies" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("replies")}
          >
            Replies
          </Badge>
        </div>
        {selectedTweets.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete ({selectedTweets.length})
          </Button>
        )}
      </div>
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {tweets.length > 0 ? (
            tweets.map((tweet) => (
              <div key={tweet.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTweets.includes(tweet.id)}
                    onChange={() => toggleTweetSelection(tweet.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm line-clamp-2">{tweet.content}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDate(tweet.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {tweet.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        {tweet.retweets}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {tweet.replies}
                      </div>
                      <div className="ml-auto">{tweet.impressions.toLocaleString()} impressions</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No tweets found</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

