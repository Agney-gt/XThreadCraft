"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Clock, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface ScheduledTweet {
  id: string
  tweetId: string
  text: string
  scheduledTime: string
}

interface ScheduledDeletionsProps {
  scheduledTweets: ScheduledTweet[]
  onCancel: (id: string) => Promise<boolean>
}

export function ScheduledDeletions({ scheduledTweets, onCancel }: ScheduledDeletionsProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const handleCancel = async (id: string) => {
    setCancelingId(id)
    try {
      await onCancel(id)
    } finally {
      setCancelingId(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tweet</TableHead>
            <TableHead>Scheduled For</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scheduledTweets.map((scheduled) => (
            <TableRow key={scheduled.id}>
              <TableCell className="font-medium max-w-[300px] truncate">{scheduled.text}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(scheduled.scheduledTime), "PPp")}</span>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(scheduled.id)}
                  disabled={cancelingId === scheduled.id}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Cancel</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

