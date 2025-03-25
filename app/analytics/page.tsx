"use client"

import { useEffect, useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Heart, Info, MessageCircle, RefreshCw, Search, Trash2, Twitter, User, Users } from "lucide-react"
import { format, subDays } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Types
interface UserProfile {
  id: string
  name: string
  username: string
  profile_image_url: string
  following_count: number
  followers_count: number
  tweet_count: number
}

interface Tweet {
  id: string
  text: string
  created_at: string
  public_metrics: {
    retweet_count: number
    reply_count: number
    like_count: number
    quote_count: number
    impression_count: number
  }
}

interface AnalyticsData {
  user: UserProfile
  tweets: Tweet[]
  todayTweets: Tweet[]
  metrics: {
    impressions: number
    likes: number
    replies: number
    retweets: number
    profileClicks: number
  }
  topInteractions: {
    id: string
    username: string
    profile_image_url: string
  }[]
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("14d")
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [activeTab])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?timeframe=${activeTab}`)
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data")
      }
      const data = await response.json()
      setAnalyticsData(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching analytics data:", err)
      setError("Failed to load analytics data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const deleteTweet = async (tweetId: string) => {
    try {
      const response = await fetch(`/api/analytics/delete-tweet`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweetId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete tweet")
      }

      // Refresh data after deletion
      fetchAnalyticsData()
    } catch (err) {
      console.error("Error deleting tweet:", err)
      setError("Failed to delete tweet. Please try again later.")
    }
  }

  const filteredTweets =
    analyticsData?.tweets.filter((tweet) => tweet.text.toLowerCase().includes(searchQuery.toLowerCase())) || []

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin" />
          <p className="text-lg text-gray-200">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <Twitter className="w-12 h-12 text-red-400" />
          <p className="text-lg text-gray-200">{error}</p>
          <Button onClick={fetchAnalyticsData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!analyticsData) return null

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      {/* User Profile Section */}
      <div className="flex flex-col items-center justify-center mt-16 mb-8">
        <Avatar className="w-20 h-20 border-2 border-blue-500">
          <img
            src={analyticsData.user.profile_image_url || "/placeholder.svg"}
            alt={analyticsData.user.name}
            className="w-full h-full object-cover"
          />
        </Avatar>
        <h1 className="text-2xl font-bold mt-2">{analyticsData.user.name}</h1>
        <p className="text-gray-400">@{analyticsData.user.username}</p>
        <div className="flex gap-6 mt-2">
          <div className="text-center">
            <p className="font-semibold">{analyticsData.user.following_count}</p>
            <p className="text-sm text-gray-400">Following</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{analyticsData.user.followers_count}</p>
            <p className="text-sm text-gray-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{analyticsData.user.tweet_count}</p>
            <p className="text-sm text-gray-400">Tweets</p>
          </div>
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="mb-8">
        <Tabs defaultValue="14d" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-md mx-auto bg-gray-800">
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="14d">14d</TabsTrigger>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="3M">3M</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Today's Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Twitter className="w-4 h-4 text-blue-400 mr-1" />
                    <span className="text-xs text-gray-400">Tweets</span>
                  </div>
                  <p className="font-bold">{analyticsData.todayTweets.length}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <User className="w-4 h-4 text-purple-400 mr-1" />
                    <span className="text-xs text-gray-400">Profile Clicks</span>
                  </div>
                  <p className="font-bold">0</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-blue-400 mr-1" />
                    <span className="text-xs text-gray-400">Followers</span>
                  </div>
                  <p className="font-bold">0</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="w-4 h-4 text-red-400 mr-1" />
                    <span className="text-xs text-gray-400">Likes</span>
                  </div>
                  <p className="font-bold">0</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <RefreshCw className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-xs text-gray-400">Retweets</span>
                  </div>
                  <p className="font-bold">0</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MessageCircle className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-xs text-gray-400">Replies</span>
                  </div>
                  <p className="font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Tweets */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Today's Tweets</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.todayTweets.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.todayTweets.map((tweet) => (
                    <div key={tweet.id} className="p-3 border border-gray-800 rounded-md">
                      <p className="text-sm">{tweet.text}</p>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>{new Date(tweet.created_at).toLocaleTimeString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" /> {tweet.public_metrics.like_count}
                          </span>
                          <span className="flex items-center">
                            <RefreshCw className="w-3 h-3 mr-1" /> {tweet.public_metrics.retweet_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 border border-dashed border-gray-800 rounded-md">
                  <div className="text-center">
                    <Twitter className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">You haven't tweeted today!</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Tweets */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">All Tweets</CardTitle>
              <Button variant="outline" size="sm" className="h-8">
                <Search className="w-4 h-4 mr-2" />
                <span>Customize</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search..."
                    className="pl-8 bg-gray-800 border-gray-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {filteredTweets.length > 0 ? (
                    filteredTweets.map((tweet) => (
                      <div key={tweet.id} className="p-3 border border-gray-800 rounded-md group">
                        <div className="flex justify-between">
                          <p className="text-sm">
                            {tweet.text.length > 100 ? `${tweet.text.substring(0, 100)}...` : tweet.text}
                          </p>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-gray-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Tweet</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this tweet? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => deleteTweet(tweet.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <span>{format(new Date(tweet.created_at), "MMM d, yyyy")}</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center">
                              <Heart className="w-3 h-3 mr-1" /> {tweet.public_metrics.like_count}
                            </span>
                            <span className="flex items-center">
                              <RefreshCw className="w-3 h-3 mr-1" /> {tweet.public_metrics.retweet_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center p-6 border border-dashed border-gray-800 rounded-md">
                      <p className="text-gray-400">No tweets found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          {/* Tweets & Replies / Impressions */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <p className="text-xs text-gray-400">Tweets & Replies</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analyticsData.tweets.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <p className="text-xs text-gray-400">Impressions</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {analyticsData.metrics.impressions > 999
                    ? `${(analyticsData.metrics.impressions / 1000).toFixed(0)}k`
                    : analyticsData.metrics.impressions}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Likes / Replies Received */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <p className="text-xs text-gray-400">Likes</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analyticsData.metrics.likes}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <p className="text-xs text-gray-400">Replies Received</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analyticsData.metrics.replies}</p>
              </CardContent>
            </Card>
          </div>

          {/* Retweets / Profile Clicks */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <p className="text-xs text-gray-400">Retweets</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analyticsData.metrics.retweets}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <p className="text-xs text-gray-400">Profile Clicks</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analyticsData.metrics.profileClicks}</p>
              </CardContent>
            </Card>
          </div>

          {/* Followers */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Followers</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follower growth over time</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="rounded-full">
                  1h
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  2h
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  4h
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  8h
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  1d
                </Badge>
              </div>
              <div className="h-[200px] flex items-end">
                <div className="w-full bg-gray-800 h-[1px] relative">
                  <div className="absolute bottom-0 right-0 text-xs text-gray-500">Mar 13</div>
                  <div className="absolute -top-[4px] left-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-medium">{analyticsData.user.followers_count}</p>
              </div>
            </CardContent>
          </Card>

          {/* Consistency */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Consistency</CardTitle>
              <div className="text-xs text-gray-400">Current streak: 2 days</div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => {
                  const date = subDays(new Date(), 34 - i)
                  const hasActivity = Math.random() > 0.7
                  return (
                    <TooltipProvider key={i}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-full aspect-square rounded-sm ${hasActivity ? "bg-blue-600" : "bg-gray-800"}`}
                          ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{format(date, "MMM d, yyyy")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
              <div className="grid grid-cols-6 gap-2 mt-2 text-xs text-gray-400">
                <div>Oct</div>
                <div>Nov</div>
                <div>Dec</div>
                <div>Jan</div>
                <div>Feb</div>
                <div>Mar</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Interactions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Top Interactions</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>People who interact with your tweets the most</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-2">
                {analyticsData.topInteractions.map((user, index) => (
                  <Avatar key={user.id} className="w-10 h-10 border">
                    <img
                      src={user.profile_image_url || "/placeholder.svg"}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Engagements */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">All Engagements</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>All interactions with your tweets</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Heart className="w-4 h-4 text-red-500" />
                <RefreshCw className="w-4 h-4 text-green-500" />
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <User className="w-4 h-4 text-yellow-500" />
                <Calendar className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-right mb-2">
                <Button variant="link" size="sm" className="h-6 text-xs">
                  Click to toggle filters!
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button variant="outline" size="sm" className="h-8">
                  Everyone
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  You Follow
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  Favorites
                </Button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search by tweet, handle, or name..." className="pl-8 bg-gray-800 border-gray-700" />
              </div>
              <div className="bg-yellow-100 text-yellow-900 p-3 rounded-md mb-4">
                <div className="font-medium mb-1">Color coding:</div>
                <div className="text-sm">
                  <div>
                    <span className="text-pink-500 font-medium">Pink names:</span> long time followers
                  </div>
                  <div>
                    <span className="text-green-500 font-medium">Green names:</span> new followers (last 24h)
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Gray names:</span> strangers (not following you)
                  </div>
                  <div>
                    <span className="underline font-medium">Underlined:</span> first comment to your tweet ever
                  </div>
                </div>
                <div className="text-right mt-2">
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    Got it
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 hover:bg-gray-800 rounded-md">
                      <Avatar className="w-8 h-8">
                        <img
                          src="/placeholder.svg?height=32&width=32"
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-sm font-medium ${
                              i % 3 === 0 ? "text-pink-500" : i % 3 === 1 ? "text-green-500" : "text-gray-500"
                            }`}
                          >
                            User Name
                          </span>
                          <span className="text-xs text-gray-400">
                            {i % 2 === 0 ? "2d ago" : i % 3 === 0 ? "6d ago" : "18d ago"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 truncate">
                          Sample tweet interaction or comment that would appear in the engagement list.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Tweet Deleter */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Tweet Deleter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Delete tweets manually from your timeline. Hover over any tweet in the "All Tweets" section and click
                the trash icon.
              </p>
              <div className="bg-gray-800 p-3 rounded-md">
                <p className="text-xs text-gray-300">
                  <span className="font-medium">Note:</span> Deleted tweets cannot be recovered. Use this feature with
                  caution.
                </p>
              </div>
              >
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

