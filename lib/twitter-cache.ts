import fs from "fs"
import path from "path"
import { TwitterApi } from "twitter-api-v2"

// Cache directory
const CACHE_DIR = path.join(process.cwd(), ".twitter-cache")
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

// Cache file paths
const CACHE_FILES = {
  user: path.join(CACHE_DIR, "user.json"),
  followers: path.join(CACHE_DIR, "followers.json"),
  following: path.join(CACHE_DIR, "following.json"),
  timeline: path.join(CACHE_DIR, "timeline.json"),
}

// Mock data for when rate limits are hit
const MOCK_DATA = {
  user: {
    id: "1892784428868653057",
    name: "Sparklog",
    username: "Sparklog0",
    profile_image_url: "/",
    public_metrics: {
      tweet_count: 2,
    },
  },
  followers: {
    data: Array(10)
      .fill(0)
      .map((_, i) => ({
        id: `follower-${i}`,
        username: `follower${i}`,
        profile_image_url: `/placeholder.svg?height=48&width=48`,
      })),
    meta: {
      result_count: 0,
    },
  },
  following: {
    data: Array(10)
      .fill(0)
      .map((_, i) => ({
        id: `following-${i}`,
        username: `following${i}`,
      })),
    meta: {
      result_count: 0,
    },
  },
  timeline: {
    data: Array(20)
      .fill(0)
      .map((_, i) => ({
        id: `tweet-${i}`,
        text: `This is a sample tweet #${i} with some text content to display in the UI.`,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        public_metrics: {
          retweet_count: Math.floor(Math.random() * 10),
          reply_count: Math.floor(Math.random() * 5),
          like_count: Math.floor(Math.random() * 20),
          quote_count: Math.floor(Math.random() * 3),
          impression_count: Math.floor(Math.random() * 100),
        },
      })),
  },
}

// Read from cache
function readCache(cacheFile: string) {
  try {
    if (fs.existsSync(cacheFile)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, "utf8"))
      if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
        return cacheData.data
      }
    }
  } catch (error) {
    console.error(`Error reading cache file ${cacheFile}:`, error)
  }
  return null
}

// Write to cache
function writeCache(cacheFile: string, data: any) {
  try {
    fs.writeFileSync(
      cacheFile,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    )
  } catch (error) {
    console.error(`Error writing cache file ${cacheFile}:`, error)
  }
}

// Initialize Twitter client
export const getTwitterClient = () => {
  // Check if we have the required environment variables
  if (!process.env.TWITTER_BEARER_TOKEN) {
    console.error("Missing Twitter API credentials")
    throw new Error("Twitter API credentials not configured")
  }

  return new TwitterApi(process.env.TWITTER_BEARER_TOKEN)
}

// Get user data with caching
export async function getUserData(userId: string) {
  // Try to get from cache first
  const cachedData = readCache(CACHE_FILES.user)
  if (cachedData) {
    return cachedData
  }

  try {
    const client = getTwitterClient()
    const twitterClient = client.readOnly

    const userData = await twitterClient.v2.user(userId, {
      "user.fields": ["profile_image_url", "public_metrics", "description", "created_at"],
    })

    if (userData.data) {
      writeCache(CACHE_FILES.user, userData.data)
      return userData.data
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
  }

  // Return mock data if API call fails
  return MOCK_DATA.user
}

// Get followers data with caching
export async function getFollowersData(userId: string) {
  // Try to get from cache first
  const cachedData = readCache(CACHE_FILES.followers)
  if (cachedData) {
    return cachedData
  }

  try {
    const client = getTwitterClient()
    const twitterClient = client.readOnly

    const followersData = await twitterClient.v2.followers(userId, {
      max_results: 10,
      "user.fields": ["profile_image_url"],
    })

    if (followersData.data) {
      writeCache(CACHE_FILES.followers, followersData)
      return followersData
    }
  } catch (error) {
    console.error("Error fetching followers data:", error)
  }

  // Return mock data if API call fails
  return MOCK_DATA.followers
}

// Get following data with caching
export async function getFollowingData(userId: string) {
  // Try to get from cache first
  const cachedData = readCache(CACHE_FILES.following)
  if (cachedData) {
    return cachedData
  }

  try {
    const client = getTwitterClient()
    const twitterClient = client.readOnly

    const followingData = await twitterClient.v2.following(userId, {
      max_results: 10,
    })

    if (followingData.data) {
      writeCache(CACHE_FILES.following, followingData)
      return followingData
    }
  } catch (error) {
    console.error("Error fetching following data:", error)
  }

  // Return mock data if API call fails
  return MOCK_DATA.following
}

// Get timeline data with caching
export async function getTimelineData(userId: string) {
  // Try to get from cache first
  const cachedData = readCache(CACHE_FILES.timeline)
  if (cachedData) {
    return cachedData
  }

  try {
    const client = getTwitterClient()
    const twitterClient = client.readOnly

    const timelineData = await twitterClient.v2.userTimeline(userId, {
      max_results: 10,
      "tweet.fields": ["created_at", "public_metrics"],
      exclude: ["retweets", "replies"],
    })

    if (timelineData.data) {
      writeCache(CACHE_FILES.timeline, timelineData.data)
      return timelineData.data
    }
  } catch (error) {
    console.error("Error fetching timeline data:", error)
  }

  // Return mock data if API call fails
  return MOCK_DATA.timeline
}

