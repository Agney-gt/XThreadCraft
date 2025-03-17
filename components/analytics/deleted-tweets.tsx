"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface DeletedTweet {
  id: string
  text: string
  deleted_at: string
  metrics?: {
    impressions: number
    likes: number
    retweets: number
    replies: number
  }
}

interface DeletedTweetsProps {
  tweets: DeletedTweet[]
}

export function DeletedTweets({ tweets }: DeletedTweetsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deleted Tweets</CardTitle>
        <CardDescription>History of your deleted tweets</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tweet</TableHead>
              <TableHead>Deleted</TableHead>
              <TableHead>Impressions</TableHead>
              <TableHead>Engagement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tweets.map((tweet) => (
              <TableRow key={tweet.id}>
                <TableCell className="font-medium max-w-[400px] truncate">{tweet.text}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(tweet.deleted_at), { addSuffix: true })}</TableCell>
                <TableCell>{tweet.metrics?.impressions?.toLocaleString() || "N/A"}</TableCell>
                <TableCell>
                  {tweet.metrics ? (
                    <span>
                      {(tweet.metrics.likes + tweet.metrics.retweets + tweet.metrics.replies).toLocaleString()}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

