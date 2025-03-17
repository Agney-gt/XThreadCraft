import { ArrowDown, ArrowUp } from "lucide-react"

interface TodaysStatsProps {
  stats: {
    tweets: number
    profileClicks: number
    followersChange: number
    likes: number
    retweets: number
    replies: number
  }
}

export function TodaysStats({ stats }: TodaysStatsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Tweets</p>
          <p className="text-xl font-bold">{stats.tweets}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Profile Clicks</p>
          <p className="text-xl font-bold">{stats.profileClicks}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Followers</p>
        <div className="flex items-center">
          <p className="text-xl font-bold">
            {stats.followersChange > 0 ? "+" : ""}
            {stats.followersChange}
          </p>
          {stats.followersChange > 0 ? (
            <ArrowUp className="ml-1 h-4 w-4 text-green-500" />
          ) : stats.followersChange < 0 ? (
            <ArrowDown className="ml-1 h-4 w-4 text-red-500" />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Likes</p>
          <p className="text-xl font-bold">{stats.likes}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Retweets</p>
          <p className="text-xl font-bold">{stats.retweets}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Replies</p>
          <p className="text-xl font-bold">{stats.replies}</p>
        </div>
      </div>
    </div>
  )
}

