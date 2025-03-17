import { TwitterApi } from "twitter-api-v2"

// Initialize the Twitter API client with the bearer token for read-only operations
const readOnlyClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || "")

// Initialize the Twitter API client with OAuth 1.0a credentials for read-write operations
const readWriteClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || "",
  appSecret: process.env.TWITTER_API_SECRET || "",
  accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
  accessSecret: process.env.TWITTER_ACCESS_SECRET || "",
})

// Get the v2 clients
const v2Client = readOnlyClient.v2
const v2ReadWriteClient = readWriteClient.v2

// Helper function to format Twitter API data for the frontend
const formatUserData = async (timeframe: string) => {
  try {
    // Get authenticated user
    const me = await v2Client.me({
      "user.fields": ["profile_image_url", "public_metrics", "description", "created_at"],
    })

    const userId = me.data.id
    const username = me.data.username
    const name = me.data.name
    const profileImageUrl = me.data.profile_image_url || "/placeholder.svg?height=100&width=100"

    // Get user metrics
    const userMetrics = me.data.public_metrics || {
      followers_count: 0,
      following_count: 0,
      tweet_count: 0,
      listed_count: 0,
    }

    // Calculate date range based on timeframe
    const endDate = new Date()
    const startDate = new Date()

    switch (timeframe) {
      case "24h":
        startDate.setDate(startDate.getDate() - 1)
        break
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "14d":
        startDate.setDate(startDate.getDate() - 14)
        break
      case "1M":
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case "3M":
        startDate.setMonth(startDate.getMonth() - 3)
        break
      default:
        startDate.setDate(startDate.getDate() - 7) // Default to 7 days
    }

    // Format dates for Twitter API
    const startTime = startDate.toISOString()
    const endTime = endDate.toISOString()

    // Get user tweets within the timeframe
    const tweets = await v2Client.userTimeline(userId, {
      start_time: startTime,
      end_time: endTime,
      max_results: 100,
      "tweet.fields": ["public_metrics", "created_at", "conversation_id"],
      exclude: ["retweets", "replies"],
    })

    // Get user replies within the timeframe
    const replies = await v2Client.userTimeline(userId, {
      start_time: startTime,
      end_time: endTime,
      max_results: 100,
      "tweet.fields": ["public_metrics", "created_at", "conversation_id", "in_reply_to_user_id"],
      exclude: ["retweets"],
    })

    // Filter to only include replies
    const repliesOnly = replies.data.data.filter((tweet) => tweet.in_reply_to_user_id)

    // Calculate today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaysTweets = tweets.data.data.filter((tweet) => {
      const tweetDate = new Date(tweet.created_at || "")
      return tweetDate >= today
    })

    const todaysReplies = repliesOnly.filter((tweet) => {
      const tweetDate = new Date(tweet.created_at || "")
      return tweetDate >= today
    })

    // Calculate engagement metrics
    let totalImpressions = 0
    let totalLikes = 0
    let totalRetweets = 0
    let totalReplies = 0

    tweets.data.data.forEach((tweet) => {
      const metrics = tweet.public_metrics || {
        impression_count: 0,
        like_count: 0,
        retweet_count: 0,
        reply_count: 0,
      }

      totalImpressions += metrics.impression_count || 0
      totalLikes += metrics.like_count || 0
      totalRetweets += metrics.retweet_count || 0
      totalReplies += metrics.reply_count || 0
    })

    // Get followers data for growth chart
    // Note: Twitter API v2 doesn't provide historical follower counts directly
    // In a production app, you would store this data daily in your own database
    // For this example, we'll simulate it based on current count
    const followersGrowth = []
    const currentFollowers = userMetrics.followers_count

    // Create simulated historical data based on timeframe
    const daysToSimulate =
      timeframe === "24h" ? 1 : timeframe === "7d" ? 7 : timeframe === "14d" ? 14 : timeframe === "1M" ? 30 : 90

    for (let i = daysToSimulate; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Simulate some random variation in follower count
      const randomVariation = Math.floor(Math.random() * 5) - 2 // Between -2 and +2
      const followerCount = Math.max(0, currentFollowers - i * 3 + randomVariation)

      followersGrowth.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        followers: followerCount,
      })
    }

    // Format the data for the frontend
    return {
      profile: {
        name,
        username: `@${username}`,
        avatar: profileImageUrl,
        following: userMetrics.following_count,
        followers: userMetrics.followers_count,
        totalTweets: userMetrics.tweet_count,
      },
      todaysStats: {
        tweets: todaysTweets.length,
        profileClicks: 0, // Not available directly from Twitter API
        followersChange: Math.floor(Math.random() * 20) - 5, // Simulated for demo
        likes: todaysTweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.like_count || 0), 0),
        retweets: todaysTweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.retweet_count || 0), 0),
        replies: todaysTweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.reply_count || 0), 0),
      },
      tweetsToday: todaysTweets.length > 0,
      engagement: {
        totalTweets: tweets.data.data.length,
        totalReplies: repliesOnly.length,
        impressions: totalImpressions,
        likes: totalLikes,
        replies: totalReplies,
        retweets: totalRetweets,
        profileClicks: 0, // Not available directly from Twitter API
      },
      followersGrowth,
      tweets: tweets.data.data.map((tweet) => ({
        id: tweet.id,
        content: tweet.text,
        date: tweet.created_at,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        impressions: tweet.public_metrics?.impression_count || 0,
      })),
    }
  } catch (error) {
    console.error("Error fetching Twitter data:", error)
    throw error
  }
}

// Get top interactions (users who engage with your tweets the most)
const getTopInteractions = async () => {
  try {
    // Get authenticated user
    const me = await v2Client.me()
    const userId = me.data.id

    // Get recent tweets
    const tweets = await v2Client.userTimeline(userId, {
      max_results: 100,
      "tweet.fields": ["public_metrics", "created_at"],
      exclude: ["retweets"],
    })

    // Get tweet IDs
    const tweetIds = tweets.data.data.map((tweet) => tweet.id)

    // For each tweet, get users who liked it
    const interactionUsers: Record<string, { count: number; username: string; name: string; profileImageUrl: string }> =
      {}

    for (const tweetId of tweetIds.slice(0, 10)) {
      // Limit to 10 tweets to avoid rate limits
      try {
        // Get liking users
        const likingUsers = await v2Client.tweetLikedBy(tweetId, {
          "user.fields": ["profile_image_url", "username", "name"],
        })

        // Get retweeting users
        const retweetingUsers = await v2Client.tweetRetweetedBy(tweetId, {
          "user.fields": ["profile_image_url", "username", "name"],
        })

        // Combine and count interactions
        const allUsers = [...likingUsers.data, ...retweetingUsers.data]

        allUsers.forEach((user) => {
          if (interactionUsers[user.id]) {
            interactionUsers[user.id].count += 1
          } else {
            interactionUsers[user.id] = {
              count: 1,
              username: user.username,
              name: user.name,
              profileImageUrl: user.profile_image_url || "/placeholder.svg?height=40&width=40",
            }
          }
        })
      } catch (error) {
        console.error(`Error fetching interactions for tweet ${tweetId}:`, error)
        // Continue with other tweets
      }
    }

    // Sort users by interaction count and return top 5
    const topUsers = Object.entries(interactionUsers)
      .map(([id, data]) => ({
        id,
        name: data.name,
        username: `@${data.username}`,
        avatar: data.profileImageUrl,
        interactions: data.count,
      }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 5)

    return topUsers
  } catch (error) {
    console.error("Error fetching top interactions:", error)
    return []
  }
}

// Get all engagements (likes, retweets, replies)
const getAllEngagements = async () => {
  try {
    // Get authenticated user
    const me = await v2Client.me()
    const userId = me.data.id

    // Get recent tweets
    const tweets = await v2Client.userTimeline(userId, {
      max_results: 50,
      "tweet.fields": ["public_metrics", "created_at"],
      exclude: ["retweets"],
    })

    // Get tweet IDs
    const tweetIds = tweets.data.data.map((tweet) => tweet.id)

    // For each tweet, get users who engaged with it
    const engagements = []

    for (const tweetId of tweetIds.slice(0, 5)) {
      // Limit to 5 tweets to avoid rate limits
      try {
        // Get liking users
        const likingUsers = await v2Client.tweetLikedBy(tweetId, {
          "user.fields": ["profile_image_url", "username", "name", "created_at"],
        })

        // Get retweeting users
        const retweetingUsers = await v2Client.tweetRetweetedBy(tweetId, {
          "user.fields": ["profile_image_url", "username", "name", "created_at"],
        })

        // Get tweet for context
        const tweet = tweets.data.data.find((t) => t.id === tweetId)

        // Add liking users to engagements
        likingUsers.data.forEach((user) => {
          engagements.push({
            id: `like-${tweetId}-${user.id}`,
            user: {
              id: user.id,
              name: user.name,
              username: `@${user.username}`,
              avatar: user.profile_image_url || "/placeholder.svg?height=40&width=40",
              // Determine if long-time follower based on account creation date
              type: determineUserType(user.created_at),
              isFollowing: true, // Assume they're following since they engaged
              isFavorite: Math.random() > 0.8, // Random for demo
            },
            action: "liked",
            tweetId,
            tweetSnippet: tweet?.text.substring(0, 50) + "...",
            timestamp: new Date().toISOString(), // Use current time as we don't have the exact like time
            isFirstComment: false,
          })
        })

        // Add retweeting users to engagements
        retweetingUsers.data.forEach((user) => {
          engagements.push({
            id: `retweet-${tweetId}-${user.id}`,
            user: {
              id: user.id,
              name: user.name,
              username: `@${user.username}`,
              avatar: user.profile_image_url || "/placeholder.svg?height=40&width=40",
              type: determineUserType(user.created_at),
              isFollowing: true,
              isFavorite: Math.random() > 0.8,
            },
            action: "retweeted",
            tweetId,
            tweetSnippet: tweet?.text.substring(0, 50) + "...",
            timestamp: new Date().toISOString(),
            isFirstComment: false,
          })
        })
      } catch (error) {
        console.error(`Error fetching engagements for tweet ${tweetId}:`, error)
        // Continue with other tweets
      }
    }

    return engagements
  } catch (error) {
    console.error("Error fetching all engagements:", error)
    return []
  }
}

// Helper function to determine user type based on account creation date
const determineUserType = (createdAt: string | undefined) => {
  if (!createdAt) return "stranger"

  const accountCreationDate = new Date(createdAt)
  const now = new Date()
  const diffMonths =
    (now.getFullYear() - accountCreationDate.getFullYear()) * 12 + now.getMonth() - accountCreationDate.getMonth()

  if (diffMonths > 12) return "long-time"
  if (diffMonths > 3) return "recent"
  return "stranger"
}

// Delete tweets based on criteria
const deleteTweets = async (criteria: {
  startDate?: Date
  endDate?: Date
  minLikes?: number
  maxLikes?: number
  includeReplies: boolean
  includeRetweets: boolean
}) => {
  try {
    // Get authenticated user
    const me = await v2ReadWriteClient.me()
    const userId = me.data.id

    // Format dates for Twitter API
    const startTime = criteria.startDate ? criteria.startDate.toISOString() : undefined
    const endTime = criteria.endDate ? criteria.endDate.toISOString() : undefined

    // Get user tweets within the timeframe
    const tweets = await v2Client.userTimeline(userId, {
      start_time: startTime,
      end_time: endTime,
      max_results: 100,
      "tweet.fields": ["public_metrics", "created_at", "conversation_id"],
      exclude: criteria.includeRetweets ? [] : ["retweets"],
    })

    // Filter tweets based on criteria
    const tweetsToDelete = tweets.data.data.filter((tweet) => {
      // Skip replies if not included
      if (!criteria.includeReplies && tweet.in_reply_to_user_id) {
        return false
      }

      // Filter by likes count
      const likeCount = tweet.public_metrics?.like_count || 0
      if (criteria.minLikes !== undefined && likeCount < criteria.minLikes) {
        return false
      }
      if (criteria.maxLikes !== undefined && likeCount > criteria.maxLikes) {
        return false
      }

      return true
    })

    // Delete the tweets
    const deleteResults = await Promise.all(
      tweetsToDelete.map(async (tweet) => {
        try {
          await v2ReadWriteClient.deleteTweet(tweet.id)
          return { id: tweet.id, success: true }
        } catch (error) {
          console.error(`Error deleting tweet ${tweet.id}:`, error)
          return { id: tweet.id, success: false, error }
        }
      }),
    )

    const successfulDeletes = deleteResults.filter((result) => result.success)

    return {
      success: true,
      deletedCount: successfulDeletes.length,
      totalFound: tweetsToDelete.length,
    }
  } catch (error) {
    console.error("Error deleting tweets:", error)
    throw error
  }
}

export const twitterClient = {
  getUserData: formatUserData,
  getTopInteractions,
  getAllEngagements,
  deleteTweets,
}

