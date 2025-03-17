"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface TopUser {
  id: string
  name: string
  username: string
  avatar: string
  interactions: number
}

export function TopInteractions() {
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopInteractions = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/twitter/top-interactions")

        if (!response.ok) {
          throw new Error("Failed to fetch top interactions")
        }

        const data = await response.json()
        setTopUsers(data)
      } catch (err) {
        console.error("Error fetching top interactions:", err)
        setError("Failed to load top interactions")
      } finally {
        setLoading(false)
      }
    }

    fetchTopInteractions()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-12 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {topUsers.length > 0 ? (
          topUsers.map((user) => (
            <Avatar
              key={user.id}
              className="h-12 w-12 border-2 border-white shadow-sm"
              title={`${user.name} (${user.interactions} interactions)`}
            >
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No interactions found</div>
        )}
      </div>

      {topUsers.length > 0 && (
        <Button variant="outline" size="sm" className="w-full">
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

