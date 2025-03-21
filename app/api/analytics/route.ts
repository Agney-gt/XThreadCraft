import { type NextRequest, NextResponse } from "next/server"
import { getUserData, getFollowersData, getFollowingData, getTimelineData } from "@/lib/twitter-cache"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get("timeframe") || "14d"

    // Use the provided user ID
    const userId = "1892784428868653057" // Fallback to provided user ID

    // Fetch all data in parallel using our cached functions
    const [userData, followersData, followingData, timelineData] = await Promise.all([
      getUserData(userId),
      getFollowersData(userId),
      getFollowingData(userId),
      getTimelineData(userId),
    ])

    // Process tweets
    const tweets = timelineData.data || []

    // Get today's tweets
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTweets = tweets.filter((tweet) => {
      const tweetDate = new Date(tweet.created_at)
      return tweetDate >= today
    })

    // Calculate metrics
    const metrics = {
      impressions: tweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.impression_count || 0), 0),
      likes: tweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.like_count || 0), 0),
      replies: tweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.reply_count || 0), 0),
      retweets: tweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.retweet_count || 0), 0),
      profileClicks: Math.floor(Math.random() * 50), // Mock data as this isn't directly available
    }

    // Mock top interactions (as this requires more complex analysis)
    const topInteractions =
      followersData.data?.slice(0, 5).map((follower) => ({
        id: follower.id,
        username: follower.username,
        profile_image_url: follower.profile_image_url || "/placeholder.svg?height=48&width=48",
      })) || []

    // Prepare response data
    const analyticsData = {
      user: {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        profile_image_url: userData.profile_image_url || "/placeholder.svg?height=128&width=128",
        following_count: followingData.meta?.result_count || 0,
        followers_count: followersData.meta?.result_count || 0,
        tweet_count: userData.public_metrics?.tweet_count || 0,
      },
      tweets,
      todayTweets,
      metrics,
      topInteractions,
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching Twitter analytics:", error)
    return NextResponse.json({ error: "Failed to fetch Twitter analytics data" }, { status: 500 })
  }
}

