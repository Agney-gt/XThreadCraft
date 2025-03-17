import { type NextRequest, NextResponse } from "next/server"
import { twitterClient } from "@/lib/twitter-client"

export async function GET(request: NextRequest) {
  try {
    // Fetch all engagements from Twitter API
    const allEngagements = await twitterClient.getAllEngagements()

    return NextResponse.json(allEngagements)
  } catch (error) {
    console.error("Error fetching all engagements:", error)
    return NextResponse.json({ error: "Failed to fetch engagements" }, { status: 500 })
  }
}

