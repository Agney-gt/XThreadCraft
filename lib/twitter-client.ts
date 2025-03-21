import { TwitterApi } from "twitter-api-v2"

// Initialize Twitter client
export const getTwitterClient = () => {
  // Check if we have the required environment variables
  if (!process.env.TWITTER_BEARER_TOKEN) {
    console.error("Missing Twitter API credentials")
    throw new Error("Twitter API credentials not configured")
  }

  return new TwitterApi(process.env.TWITTER_BEARER_TOKEN)
}

// Initialize Twitter client with write access
export const getTwitterWriteClient = () => {
  // Check if we have the required environment variables
  if (
    !process.env.TWITTER_API_KEY ||
    !process.env.TWITTER_API_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN ||
    !process.env.TWITTER_ACCESS_SECRET
  ) {
    console.error("Missing Twitter API credentials for write access")
    throw new Error("Twitter API credentials not configured for write access")
  }

  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  })
}

