"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"

export function TweetDeleter() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [minLikes, setMinLikes] = useState<string>("")
  const [maxLikes, setMaxLikes] = useState<string>("")
  const [includeReplies, setIncludeReplies] = useState(false)
  const [includeRetweets, setIncludeRetweets] = useState(false)
  const [deleteCount, setDeleteCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const handleSearch = async () => {
    try {
      setSearchLoading(true)

      // Call the API to search for tweets matching the criteria
      const response = await fetch("/api/twitter/delete-tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          minLikes,
          maxLikes,
          includeReplies,
          includeRetweets,
          searchOnly: true, // Flag to indicate we're just searching, not deleting
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to search tweets")
      }

      const data = await response.json()
      setDeleteCount(data.totalFound || 0)

      if (data.totalFound === 0) {
        toast({
          title: "No tweets found",
          description: "No tweets match your criteria.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error searching tweets:", error)
      toast({
        title: "Error",
        description: "Failed to search tweets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSearchLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteCount || deleteCount === 0) return

    if (!confirm(`Are you sure you want to delete ${deleteCount} tweets? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)

      // Call the API to delete tweets matching the criteria
      const response = await fetch("/api/twitter/delete-tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          minLikes,
          maxLikes,
          includeReplies,
          includeRetweets,
          searchOnly: false, // Flag to indicate we're actually deleting
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete tweets")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: `Successfully deleted ${data.deletedCount} tweets.`,
        variant: "default",
      })

      // Reset the form
      setDeleteCount(null)
    } catch (error) {
      console.error("Error deleting tweets:", error)
      toast({
        title: "Error",
        description: "Failed to delete tweets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Deleted tweets cannot be recovered. This action is permanent.</AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date-from">From Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-to">To Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="min-likes">Minimum Likes</Label>
          <Input
            id="min-likes"
            type="number"
            placeholder="0"
            value={minLikes}
            onChange={(e) => setMinLikes(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-likes">Maximum Likes</Label>
          <Input
            id="max-likes"
            type="number"
            placeholder="No limit"
            value={maxLikes}
            onChange={(e) => setMaxLikes(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-replies"
            checked={includeReplies}
            onCheckedChange={(checked) => setIncludeReplies(checked === true)}
          />
          <Label htmlFor="include-replies">Include replies</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-retweets"
            checked={includeRetweets}
            onCheckedChange={(checked) => setIncludeRetweets(checked === true)}
          />
          <Label htmlFor="include-retweets">Include retweets</Label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSearch} className="flex-1" disabled={searchLoading}>
          {searchLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Search Tweets
        </Button>

        {deleteCount !== null && deleteCount > 0 && (
          <Button variant="destructive" onClick={handleDelete} className="flex-1" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="mr-2 h-4 w-4" />
            Delete {deleteCount} Tweets
          </Button>
        )}
      </div>
    </div>
  )
}

