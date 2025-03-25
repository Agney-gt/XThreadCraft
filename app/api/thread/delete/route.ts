import { NextResponse } from "next/server"
import { TwitterApi } from "twitter-api-v2"

// Function to create a Twitter API client dynamically for each user
async function getTwitterClient(userAccessToken: string, userAccessSecret: string): Promise<TwitterApi> {
  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
    throw new Error("Twitter API credentials are not configured")
  }

  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: userAccessToken,
    accessSecret: userAccessSecret,
  })
}

export async function POST(request: Request) {
  try {
    console.log("Thread deletion API request received...")

    const data = await request.json()
    console.log("Request data:", data)

    // Extract user authentication tokens and thread IDs
    const { userAccessToken, userAccessSecret, threadIds } = data

    if (!userAccessToken || !userAccessSecret) {
      console.error("Missing user credentials")
      return NextResponse.json({ success: false, error: "Missing user credentials" }, { status: 400 })
    }

    if (!threadIds || !Array.isArray(threadIds) || threadIds.length === 0) {
      console.error("No thread IDs provided for deletion")
      return NextResponse.json({ success: false, error: "No thread IDs provided" }, { status: 400 })
    }

    console.log("User credentials received, initializing Twitter API client...")

    // Create a Twitter client for the authenticated user
    const client = await getTwitterClient(userAccessToken, userAccessSecret)
    console.log("Twitter API client initialized.")

    console.log(`Deleting ${threadIds.length} threads...`)

    // For each thread ID, we need to delete all tweets in the thread
    const results = await Promise.allSettled(
      threadIds.map(async (threadId) => {
        try {
          // For a thread, we need to delete the first tweet which should cascade delete the thread
          // Or we can delete each tweet in the thread individually
          await client.v2.deleteTweet(threadId)
          return { threadId, success: true }
        } catch (error) {
          console.error(`Error deleting thread ${threadId}:`, error)
          return { threadId, success: false, error: error.message }
        }
      }),
    )

    // Process results
    const successfulDeletes = results
      .filter(
        (result): result is PromiseFulfilledResult<{ threadId: string; success: true }> =>
          result.status === "fulfilled" && result.value.success,
      )
      .map((result) => result.value.threadId)

    const failedDeletes = results
      .filter(
        (result): result is PromiseFulfilledResult<{ threadId: string; success: false; error: string }> =>
          result.status === "fulfilled" && !result.value.success,
      )
      .map((result) => ({
        id: result.value.threadId,
        error: result.value.error,
      }))

    console.log(`Successfully deleted ${successfulDeletes.length} threads`)
    if (failedDeletes.length > 0) {
      console.error(`Failed to delete ${failedDeletes.length} threads`)
    }

    return NextResponse.json({
      success: true,
      deleted: successfulDeletes,
      failed: failedDeletes,
    })
  } catch (error) {
    console.error("Error deleting threads:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete threads",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

