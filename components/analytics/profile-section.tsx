"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Twitter } from "lucide-react"

interface ProfileSectionProps {
  profile: {
    name: string
    username: string
    avatar: string
    following: number
    followers: number
    totalTweets: number
  }
  timeFilter: string
  onTimeFilterChange: (value: string) => void
}

export function ProfileSection({ profile, timeFilter, onTimeFilterChange }: ProfileSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Avatar className="h-20 w-20 border-4 border-white">
          <AvatarImage src={profile.avatar} alt={profile.name} />
          <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-blue-100">{profile.username}</p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
            <div>
              <p className="text-sm text-blue-100">Following</p>
              <p className="font-bold">{profile.following.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-blue-100">Followers</p>
              <p className="font-bold">{profile.followers.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-blue-100">Tweets</p>
              <p className="font-bold">{profile.totalTweets.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button size="sm" variant="secondary" className="gap-2">
            <Twitter className="h-4 w-4" />
            View on Twitter
          </Button>

          <Select value={timeFilter} onValueChange={onTimeFilterChange}>
            <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="1M">Last month</SelectItem>
              <SelectItem value="3M">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

