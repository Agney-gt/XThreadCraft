"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Repeat, Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Engagement {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar: string
    type: string
    isFollowing: boolean
    isFavorite: boolean
  }
  action: string
  tweetId: string
  tweetSnippet: string
  timestamp: string
  isFirstComment: boolean
}

export function AllEngagements() {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("everyone")

  useEffect(() => {
    const fetchEngagements = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/twitter/all-engagements")

        if (!response.ok) {
          throw new Error("Failed to fetch engagements")
        }

        const data = await response.json()
        setEngagements(data)
      } catch (err) {
        console.error("Error fetching engagements:", err)
        setError("Failed to load engagements")
      } finally {
        setLoading(false)
      }
    }

    fetchEngagements()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  }

  const getUserBadgeColor = (userType: string) => {
    switch (userType) {
      case "long-time":
        return "bg-pink-50 text-pink-600 border-pink-200"
      case "recent":
        return "bg-green-50 text-green-600 border-green-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "liked":
        return <Heart className="h-4 w-4 text-red-500" />
      case "retweeted":
        return <Repeat className="h-4 w-4 text-green-500" />
      case "replied to":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  // Filter engagements based on selected filter
  const filteredEngagements = engagements.filter((engagement) => {
    if (filter === "everyone") return true
    if (filter === "following") return engagement.user.isFollowing
    if (filter === "favorites") return engagement.user.isFavorite
    return true
  })

  if (loading) {
    return (
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">{error}</div>
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="divide-y">
        {filteredEngagements.length > 0 ? (
          filteredEngagements.map((engagement) => (
            <div key={engagement.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={engagement.user.avatar} alt={engagement.user.name} />
                  <AvatarFallback>{engagement.user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{engagement.user.name}</span>
                        {engagement.user.isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                        <Badge
                          variant="outline"
                          className={`text-xs px-1.5 py-0 ${getUserBadgeColor(engagement.user.type)}`}
                        >
                          {engagement.user.type === "long-time"
                            ? "Long-time follower"
                            : engagement.user.type === "recent"
                              ? "Recent follower"
                              : "Stranger"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{engagement.user.username}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(engagement.timestamp)}</span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5">
                    {getActionIcon(engagement.action)}
                    <span className="text-sm">{engagement.action} your tweet</span>
                    {engagement.isFirstComment && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200">
                        First comment
                      </Badge>
                    )}
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground border-l-2 border-gray-200 pl-2 ml-1">
                    {engagement.tweetSnippet}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">No engagements found</div>
        )}
      </div>
    </ScrollArea>
  )
}

