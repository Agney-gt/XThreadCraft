import { type NextRequest, NextResponse } from "next/server"
import { twitterClient } from "@/lib/twitter-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate, minLikes, maxLikes, includeReplies, includeRetweets } = body

    // Parse dates from strings to Date objects
    const startDateObj = startDate ? new Date(startDate) : undefined
    const endDateObj = endDate ? new Date(endDate) : undefined

    // Delete tweets using Twitter API
    const result = await twitterClient.deleteTweets({
      startDate: startDateObj,
      endDate: endDateObj,
      minLikes: minLikes ? Number.parseInt(minLikes) : undefined,
      maxLikes: maxLikes ? Number.parseInt(maxLikes) : undefined,
      includeReplies: includeReplies === true,
      includeRetweets: includeRetweets === true,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting tweets:", error)
    return NextResponse.json({ error: "Failed to delete tweets" }, { status: 500 })
  }
}

