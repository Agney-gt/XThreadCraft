"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, Search, Loader2 } from "lucide-react"
import { FollowersChart } from "./followers-chart"
import { EngagementHoursChart } from "./engagement-hours-chart"
import { ConsistencyTracker } from "./consistency-tracker"
import { TweetsList } from "./tweets-list"
import { TopInteractions } from "./top-interactions"
import { AllEngagements } from "./all-engagements"
import { TodaysStats } from "./todays-stats"
import { ProfileSection } from "./profile-section"
import { TweetDeleter } from "./tweet-deleter"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsDashboard() {
  const [timeFilter, setTimeFilter] = useState("7d")
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch real data from Twitter API
        const response = await fetch(`/api/twitter/user-data?timeframe=${timeFilter}`)

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()
        setUserData(data)
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        setError("Failed to load Twitter data. Please check your API credentials.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeFilter])

  if (error) {
    return (
      <div className="container mx-auto p-4 lg:p-8">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
            <CardDescription>We encountered a problem while loading your Twitter data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <p className="mt-4">Please check your Twitter API credentials and try again.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 lg:p-8">
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading your Twitter analytics...</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Left Sidebar Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[100px] w-full rounded-lg" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-6 space-y-6">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Today&apos;s Stats</CardTitle>
              <CardDescription>Your Twitter activity today</CardDescription>
            </CardHeader>
            <CardContent>
              <TodaysStats stats={userData?.todaysStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Today&apos;s Tweets</CardTitle>
            </CardHeader>
            <CardContent>
              {userData?.tweetsToday ? (
                <div className="flex items-center text-green-500">
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    You&apos;ve tweeted today
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center text-amber-500">
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                    No tweets today
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Tweets</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tweets..." className="pl-8" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TweetsList />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <ProfileSection profile={userData?.profile} timeFilter={timeFilter} onTimeFilterChange={setTimeFilter} />
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tweets & Engagement</CardTitle>
                  <CardDescription>
                    {timeFilter === "24h"
                      ? "Last 24 hours"
                      : timeFilter === "7d"
                        ? "Last 7 days"
                        : timeFilter === "14d"
                          ? "Last 14 days"
                          : timeFilter === "1M"
                            ? "Last month"
                            : "Last 3 months"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tweets & Replies</p>
                      <p className="text-2xl font-bold">
                        {userData?.engagement.totalTweets + userData?.engagement.totalReplies}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="text-2xl font-bold">{userData?.engagement.impressions.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                      <p className="text-2xl font-bold">
                        {(
                          ((userData?.engagement.likes + userData?.engagement.replies + userData?.engagement.retweets) /
                            userData?.engagement.impressions) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Profile Clicks</p>
                      <p className="text-2xl font-bold">{userData?.engagement.profileClicks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Followers Growth</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="1d">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Grouping" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="2h">2 hours</SelectItem>
                        <SelectItem value="8h">8 hours</SelectItem>
                        <SelectItem value="1d">1 day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <FollowersChart data={userData?.followersGrowth} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tweet Consistency</CardTitle>
                  <CardDescription>Your tweeting pattern over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ConsistencyTracker />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Engaging Hours</CardTitle>
                  <div className="flex items-center gap-2">
                    <Tabs defaultValue="daily" className="w-full">
                      <TabsList className="grid w-[300px] grid-cols-3">
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="custom">Custom</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <Select defaultValue="impressions">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="impressions">Impressions</SelectItem>
                        <SelectItem value="tweets">Tweets</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <EngagementHoursChart />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tweet Deleter</CardTitle>
                  <CardDescription>Bulk delete your tweets based on criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <TweetDeleter />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Interactions</CardTitle>
              <CardDescription>People who engage with you the most</CardDescription>
            </CardHeader>
            <CardContent>
              <TopInteractions />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Engagements</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Tabs defaultValue="everyone" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="everyone">Everyone</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search interactions..." className="pl-8" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AllEngagements />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

