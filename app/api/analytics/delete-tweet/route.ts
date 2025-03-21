import { type NextRequest, NextResponse } from "next/server"
import { TwitterApi } from "twitter-api-v2"

// Initialize Twitter client
const getTwitterClient = () => {
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

export async function DELETE(request: NextRequest) {
  try {
    const { tweetId } = await request.json()

    if (!tweetId) {
      return NextResponse.json({ error: "Tweet ID is required" }, { status: 400 })
    }

    // Get Twitter client with write access
    const client = getTwitterClient()

    // Delete the tweet
    await client.v2.deleteTweet(tweetId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tweet:", error)

    // Check if it's a Twitter API error
    if (error.data?.errors) {
      const twitterErrors = error.data.errors
      return NextResponse.json({ error: "Twitter API error", details: twitterErrors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to delete tweet" }, { status: 500 })
  }
}

