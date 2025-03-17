import { type NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { db } from "@/lib/db";
import { tweets, deletedTweets, scheduledDeletions, users } from "@/lib/schema";
import { eq, desc, asc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Initialize Twitter client
const getTwitterClient = async (userId: string) => {
  const userTokens = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      twitterAccessToken: true,
      twitterAccessSecret: true,
    },
  });

  if (!userTokens?.twitterAccessToken || !userTokens?.twitterAccessSecret) {
    throw new Error("Twitter tokens not found");
  }

  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: userTokens.twitterAccessToken,
    accessSecret: userTokens.twitterAccessSecret,
  });
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    switch (action) {
      case "metrics": {
        const userTweets = await db.query.tweets.findMany({
          where: eq(tweets.userId, userId),
          orderBy: desc(tweets.createdAt),
          limit: 100,
        });

        return NextResponse.json({ metrics: userTweets });
      }

      case "tweets": {
        const twitterClient = await getTwitterClient(userId);
        const user = await twitterClient.v2.me();
        const tweetsResponse = await twitterClient.v2.userTimeline(user.data.id, {
          max_results: 100,
          "tweet.fields": ["created_at", "public_metrics"],
        });

        const formattedTweets = tweetsResponse.data.data.map((tweet) => ({
          id: tweet.id,
          text: tweet.text,
          createdAt: tweet.created_at ? new Date(tweet.created_at) : new Date(),
          impressions: tweet.public_metrics?.impression_count || 0,
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
          userId,
        }));

        await db.insert(tweets).values(formattedTweets).onConflictDoNothing();

        return NextResponse.json({ tweets: formattedTweets });
      }

      case "deleted": {
        const userDeletedTweets = await db.query.deletedTweets.findMany({
          where: eq(deletedTweets.userId, userId),
          orderBy: desc(deletedTweets.deletedAt),
          limit: 100,
        });

        return NextResponse.json({ deletedTweets: userDeletedTweets });
      }

      case "scheduled": {
        const userScheduledDeletions = await db.query.scheduledDeletions.findMany({
          where: eq(scheduledDeletions.userId, userId),
          orderBy: asc(scheduledDeletions.scheduledTime),
        });

        return NextResponse.json({ scheduledTweets: userScheduledDeletions });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { action, tweetId, scheduledTime, id } = body;

    switch (action) {
      case "delete": {
        if (!tweetId) return NextResponse.json({ error: "Tweet ID is required" }, { status: 400 });
        
        const twitterClient = await getTwitterClient(userId);
        await twitterClient.v2.deleteTweet(tweetId);

        const tweetData = await db.query.tweets.findFirst({ where: eq(tweets.id, tweetId) });
        if (tweetData) {
          await db.insert(deletedTweets).values({ ...tweetData, tweetId: tweetData.id, deletedAt: new Date() });
          await db.delete(tweets).where(eq(tweets.id, tweetId));
        }

        await db.delete(scheduledDeletions).where(eq(scheduledDeletions.tweetId, tweetId));

        return NextResponse.json({ success: true });
      }

      case "schedule": {
        if (!tweetId || !scheduledTime) return NextResponse.json({ error: "Tweet ID and scheduled time are required" }, { status: 400 });

        const twitterClient = await getTwitterClient(userId);
        const tweetResponse = await twitterClient.v2.singleTweet(tweetId, { "tweet.fields": ["text"] });

        await db.insert(scheduledDeletions).values({
          tweetId,
          userId,
          text: tweetResponse.data.text,
          scheduledTime: new Date(scheduledTime),
          createdAt: new Date(),
        });

        return NextResponse.json({ success: true });
      }

      case "cancelScheduled": {
        if (!id) return NextResponse.json({ error: "Scheduled deletion ID is required" }, { status: 400 });
        await db.delete(scheduledDeletions).where(eq(scheduledDeletions.id, id));
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
