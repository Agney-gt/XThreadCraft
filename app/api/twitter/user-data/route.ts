import { type NextRequest, NextResponse } from "next/server"
import { twitterClient } from "@/lib/twitter-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get("timeframe") || "7d"

    // Fetch real data from Twitter API
    const userData = await twitterClient.getUserData(timeframe)

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Failed to fetch Twitter data" }, { status: 500 })
  }
}

