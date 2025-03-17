import { type NextRequest, NextResponse } from "next/server"
import { twitterClient } from "@/lib/twitter-client"

export async function GET(request: NextRequest) {
  try {
    // Fetch top interactions from Twitter API
    const topInteractions = await twitterClient.getTopInteractions()

    return NextResponse.json(topInteractions)
  } catch (error) {
    console.error("Error fetching top interactions:", error)
    return NextResponse.json({ error: "Failed to fetch top interactions" }, { status: 500 })
  }
}

