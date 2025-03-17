"use client";

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { ImpressionsCard, LikesCard, RetweetsCard, RepliesCard } from "@/components/analytics/metrics-card"
import { MetricsChart } from "@/components/analytics/metrics-chart"
import { TweetTable } from "@/components/analytics/tweet-table"
import { DeletedTweets } from "@/components/analytics/deleted-tweets"
import { TweetDeleter } from "@/components/analytics/tweet-deleter"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScheduledDeletions } from "@/components/analytics/scheduled-deletions"

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<any[]>([])
  const [tweets, setTweets] = useState<any[]>([])
  const [deletedTweets, setDeletedTweets] = useState<any[]>([])
  const [scheduledTweets, setScheduledTweets] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [error, setError] = useState<string | null>(null)

  // Calculate total metrics
  const totalImpressions = metrics.reduce((sum, day) => sum + day.impressions, 0)
  const totalLikes = metrics.reduce((sum, day) => sum + day.likes, 0)
  const totalRetweets = metrics.reduce((sum, day) => sum + day.retweets, 0)
  const totalReplies = metrics.reduce((sum, day) => sum + day.replies, 0)

  // Calculate percentage changes based on real data
  // Compare the last 7 days with the previous 7 days
  const calculatePercentageChange = (metricName: string) => {
    if (metrics.length < 14) return 0

    const last7Days = metrics.slice(0, 7)
    const previous7Days = metrics.slice(7, 14)

    const last7DaysSum = last7Days.reduce((sum, day) => sum + (day[metricName] || 0), 0)
    const previous7DaysSum = previous7Days.reduce((sum, day) => sum + (day[metricName] || 0), 0)

    if (previous7DaysSum === 0) return 0
    return ((last7DaysSum - previous7DaysSum) / previous7DaysSum) * 100
  }

  const impressionsChange = calculatePercentageChange("impressions")
  const likesChange = calculatePercentageChange("likes")
  const retweetsChange = calculatePercentageChange("retweets")
  const repliesChange = calculatePercentageChange("replies")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch metrics
      const metricsResponse = await fetch("/api/analytics?action=metrics")
      if (!metricsResponse.ok) {
        throw new Error(`Failed to fetch metrics: ${metricsResponse.status}`)
      }
      const metricsData = await metricsResponse.json()

      // Process metrics data for the chart
      const processedMetrics = processMetricsForChart(metricsData.metrics || [])
      setMetrics(processedMetrics)

      // Fetch tweets
      const tweetsResponse = await fetch("/api/analytics?action=tweets")
      if (!tweetsResponse.ok) {
        throw new Error(`Failed to fetch tweets: ${tweetsResponse.status}`)
      }
      const tweetsData = await tweetsResponse.json()
      setTweets(tweetsData.tweets || [])

      // Fetch deleted tweets
      const deletedResponse = await fetch("/api/analytics?action=deleted")
      if (!deletedResponse.ok) {
        throw new Error(`Failed to fetch deleted tweets: ${deletedResponse.status}`)
      }
      const deletedData = await deletedResponse.json()
      setDeletedTweets(deletedData.deletedTweets || [])

      // Fetch scheduled deletions
      const scheduledResponse = await fetch("/api/analytics?action=scheduled")
      if (!scheduledResponse.ok) {
        throw new Error(`Failed to fetch scheduled deletions: ${scheduledResponse.status}`)
      }
      const scheduledData = await scheduledResponse.json()
      setScheduledTweets(scheduledData.scheduledTweets || [])
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      await fetchData()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDeleteTweet = async (tweetId: string) => {
    try {
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          tweetId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete tweet: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Refresh data after deletion
        await fetchData()
        return true
      }

      return false
    } catch (error) {
      console.error("Error deleting tweet:", error)
      setError(error instanceof Error ? error.message : "Failed to delete tweet")
      return false
    }
  }

  const handleScheduleDeletion = async (tweetId: string, scheduledTime: Date) => {
    try {
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "schedule",
          tweetId,
          scheduledTime: scheduledTime.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to schedule tweet deletion: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Refresh data after scheduling
        await fetchData()
        return true
      }

      return false
    } catch (error) {
      console.error("Error scheduling tweet deletion:", error)
      setError(error instanceof Error ? error.message : "Failed to schedule tweet deletion")
      return false
    }
  }

  const handleCancelScheduledDeletion = async (id: string) => {
    try {
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "cancelScheduled",
          id,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to cancel scheduled deletion: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Refresh data after cancellation
        await fetchData()
        return true
      }

      return false
    } catch (error) {
      console.error("Error cancelling scheduled deletion:", error)
      setError(error instanceof Error ? error.message : "Failed to cancel scheduled deletion")
      return false
    }
  }

  // Process metrics data for the chart
  const processMetricsForChart = (rawMetrics: any[]) => {
    if (!rawMetrics || rawMetrics.length === 0) {
      return []
    }

    // Group metrics by date
    const groupedByDate = rawMetrics.reduce(
      (acc, metric) => {
        const date = new Date(metric.timestamp).toISOString().split("T")[0]

        if (!acc[date]) {
          acc[date] = {
            date,
            impressions: 0,
            likes: 0,
            retweets: 0,
            replies: 0,
          }
        }

        acc[date].impressions += metric.impressions || 0
        acc[date].likes += metric.likes || 0
        acc[date].retweets += metric.retweets || 0
        acc[date].replies += metric.replies || 0

        return acc
      },
      {} as Record<string, any>,
    )

    // Convert to array and sort by date
    return Object.values(groupedByDate)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reverse()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <Button onClick={refreshData} disabled={isRefreshing || isLoading}>
          {isRefreshing ? "Refreshing..." : "Refresh"}
          <RefreshCw className={`ml-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tweets">Tweets</TabsTrigger>
            <TabsTrigger value="deleted">Deleted Tweets</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <ImpressionsCard value={totalImpressions} change={impressionsChange} />
              <LikesCard value={totalLikes} change={likesChange} />
              <RetweetsCard value={totalRetweets} change={retweetsChange} />
              <RepliesCard value={totalReplies} change={repliesChange} />
            </div>

            {metrics.length > 0 ? (
              <MetricsChart data={metrics} title="Engagement Overview" description="View metrics trends over time" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Data Available</CardTitle>
                  <CardDescription>There is no metrics data available for the chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 border rounded-md border-dashed">
                    <p className="text-muted-foreground">No metrics data found</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tweets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tweets</CardTitle>
                <CardDescription>View and manage your recent tweets</CardDescription>
              </CardHeader>
              <CardContent>
                {tweets.length > 0 ? (
                  <TweetTable tweets={tweets} onDelete={handleDeleteTweet} onSchedule={handleScheduleDeletion} />
                ) : (
                  <div className="flex items-center justify-center h-40 border rounded-md border-dashed">
                    <p className="text-muted-foreground">No tweets found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deleted" className="space-y-4">
            {deletedTweets.length > 0 ? (
              <DeletedTweets tweets={deletedTweets} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Deleted Tweets</CardTitle>
                  <CardDescription>No deleted tweets found</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 border rounded-md border-dashed">
                    <p className="text-muted-foreground">No deleted tweets in your history</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TweetDeleter onDelete={handleDeleteTweet} />

              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Deletion</CardTitle>
                  <CardDescription>Schedule tweets for automatic deletion</CardDescription>
                </CardHeader>
                <CardContent>
                  {scheduledTweets.length > 0 ? (
                    <ScheduledDeletions scheduledTweets={scheduledTweets} onCancel={handleCancelScheduledDeletion} />
                  ) : (
                    <div className="flex items-center justify-center h-40 border rounded-md border-dashed">
                      <p className="text-muted-foreground">No scheduled deletions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

