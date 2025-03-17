"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { BarChart3, Clock, ExternalLink, Heart, MessageCircle, MoreHorizontal, Repeat, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"

interface Tweet {
  id: string
  text: string
  created_at: string
  metrics: {
    impressions: number
    likes: number
    retweets: number
    replies: number
  }
}

interface TweetTableProps {
  tweets: Tweet[]
  onDelete: (tweetId: string) => Promise<boolean>
  onSchedule: (tweetId: string, scheduledTime: Date) => Promise<boolean>
}

export function TweetTable({ tweets, onDelete, onSchedule }: TweetTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [scheduleTweet, setScheduleTweet] = useState<Tweet | null>(null)
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [scheduledTime, setScheduledTime] = useState<string>("")
  const [isScheduling, setIsScheduling] = useState(false)

  const handleDelete = async (tweetId: string) => {
    setIsDeleting(tweetId)
    try {
      const success = await onDelete(tweetId)
      return success
    } catch (error) {
      console.error("Error deleting tweet:", error)
      return false
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSchedule = async () => {
    if (!scheduleTweet || !scheduledDate || !scheduledTime) return

    setIsScheduling(true)
    try {
      // Parse time and combine with date
      const [hours, minutes] = scheduledTime.split(":").map(Number)
      const scheduledDateTime = new Date(scheduledDate)
      scheduledDateTime.setHours(hours, minutes)

      const success = await onSchedule(scheduleTweet.id, scheduledDateTime)
      if (success) {
        setScheduleTweet(null)
        setScheduledDate(undefined)
        setScheduledTime("")
      }
      return success
    } catch (error) {
      console.error("Error scheduling tweet deletion:", error)
      return false
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tweet</TableHead>
              <TableHead className="w-[100px]">
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Impressions</span>
                </div>
              </TableHead>
              <TableHead className="w-[80px]">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>Likes</span>
                </div>
              </TableHead>
              <TableHead className="w-[80px]">
                <div className="flex items-center gap-1">
                  <Repeat className="h-4 w-4" />
                  <span>RTs</span>
                </div>
              </TableHead>
              <TableHead className="w-[80px]">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>Replies</span>
                </div>
              </TableHead>
              <TableHead className="w-[80px]">Age</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tweets.map((tweet) => (
              <TableRow key={tweet.id}>
                <TableCell className="font-medium max-w-[300px] truncate">{tweet.text}</TableCell>
                <TableCell>{tweet.metrics.impressions.toLocaleString()}</TableCell>
                <TableCell>{tweet.metrics.likes.toLocaleString()}</TableCell>
                <TableCell>{tweet.metrics.retweets.toLocaleString()}</TableCell>
                <TableCell>{tweet.metrics.replies.toLocaleString()}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => window.open(`https://twitter.com/i/status/${tweet.id}`, "_blank")}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Tweet</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setScheduleTweet(tweet)} className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Schedule Deletion</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(tweet.id)}
                        disabled={isDeleting === tweet.id}
                        className="flex items-center gap-2 text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{isDeleting === tweet.id ? "Deleting..." : "Delete Tweet"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={scheduleTweet !== null} onOpenChange={(open) => !open && setScheduleTweet(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Tweet Deletion</DialogTitle>
            <DialogDescription>Set a date and time when this tweet should be automatically deleted.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tweet-text">Tweet</Label>
              <div id="tweet-text" className="p-2 border rounded-md text-sm">
                {scheduleTweet?.text}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker date={scheduledDate} setDate={setScheduledDate} className="w-full" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleTweet(null)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={!scheduledDate || !scheduledTime || isScheduling}>
              {isScheduling ? "Scheduling..." : "Schedule Deletion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

